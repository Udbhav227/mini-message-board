const pool = require("./pool");


const FLAG_SINK = `CASE WHEN flags >= 10 THEN 1 ELSE 0 END ASC`;

const SORT_SQL = {
  // Newest first
  new: `${FLAG_SINK}, added DESC`,

  // Most liked overall
  top: `${FLAG_SINK}, likes DESC, added DESC`,

  // log10(likes+1) / hours_since_posted^0.8
  // NULLIF prevents division by zero for brand-new posts (< 1hr old).
  hot: `
    ${FLAG_SINK},
    LOG(GREATEST(likes + 1, 1)) /
      NULLIF(POWER(EXTRACT(EPOCH FROM (NOW() - added)) / 3600.0 + 2, 0.8), 0)
    DESC,
    added DESC
  `,

  // Rising: recent posts (last 24h) ranked by likes gained
  rising: `
    ${FLAG_SINK},
    CASE
      WHEN added > NOW() - INTERVAL '24 hours'
        THEN likes
      ELSE -1
    END DESC,
    added DESC
  `,

  // Controversial: posts that have both likes AND flags (divisive content)
  // High likes * high flags = high score
  controversial: `
    ${FLAG_SINK},
    (likes + 1) * (flags + 1) DESC,
    added DESC
  `,
};

const VALID_SORTS = new Set(Object.keys(SORT_SQL));

async function getAllMessages(sort = "hot") {
  const safeSort = VALID_SORTS.has(sort) ? sort : "hot";
  const { rows } = await pool.query(
    `SELECT * FROM messages ORDER BY ${SORT_SQL[safeSort]}`,
  );
  return rows;
}

async function getMessageById(id) {
  const { rows } = await pool.query("SELECT * FROM messages WHERE id = $1", [
    id,
  ]);
  return rows[0];
}

async function insertMessage(user, text) {
  await pool.query('INSERT INTO messages ("user", text) VALUES ($1, $2)', [
    user,
    text,
  ]);
}

async function updateLikes(id, delta) {
  const { rows } = await pool.query(
    `UPDATE messages
     SET likes = GREATEST(0, likes + $1)
     WHERE id = $2
     RETURNING likes`,
    [delta, id],
  );
  return rows[0]?.likes ?? 0;
}

async function updateFlags(id, incrementBy) {
  const { rows } = await pool.query(
    `UPDATE messages
     SET flags = flags + $1
     WHERE id = $2
     RETURNING flags`,
    [incrementBy, id],
  );
  return rows[0]?.flags ?? 0;
}

module.exports = {
  getAllMessages,
  getMessageById,
  insertMessage,
  updateLikes,
  updateFlags,
  VALID_SORTS,
};
