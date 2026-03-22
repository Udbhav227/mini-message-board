const pool = require("./pool");

async function getAllMessages() {
  const { rows } = await pool.query(
    "SELECT * FROM messages ORDER BY added DESC",
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

async function updateLikes(id, incrementBy) {
  const { rows } = await pool.query(
    "UPDATE messages SET likes = likes + $1 WHERE id = $2 RETURNING likes",
    [incrementBy, id],
  );
  return rows[0].likes;
}

async function updateFlags(id, incrementBy) {
  const { rows } = await pool.query(
    "UPDATE messages SET flags = flags + $1 WHERE id = $2 RETURNING flags",
    [incrementBy, id],
  );
  return rows[0].flags;
}

module.exports = {
  getAllMessages,
  getMessageById,
  insertMessage,
  updateLikes,
  updateFlags,
};
