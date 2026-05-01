const pool = require("./pool");

async function getAllMessages() {
  const { rows } = await pool.query(`
    SELECT *
    FROM messages
    ORDER BY
      CASE WHEN flags >= 10 THEN 1 ELSE 0 END ASC,  -- flagged posts sink
      added DESC                                      -- newest first within each group
  `);
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
};
