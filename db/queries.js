const pool = require("./pool");

// Get all messages, newest first
async function getAllMessages() {
  const { rows } = await pool.query(
    "SELECT * FROM messages ORDER BY added DESC",
  );
  return rows;
}
// Get a message by its ID
async function getMessageById(id) {
  const { rows } = await pool.query("SELECT * FROM messages WHERE id = $1", [
    id,
  ]);
  return rows[0];
}

// Insert a new message
async function insertMessage(user, text) {
  await pool.query('INSERT INTO messages ("user", text) VALUES ($1, $2)', [
    user,
    text,
  ]);
}

// Update the like count
async function updateLikes(id, incrementBy) {
  const { rows } = await pool.query(
    "UPDATE messages SET likes = likes + $1 WHERE id = $2 RETURNING likes",
    [incrementBy, id],
  );
  return rows[0].likes;
}

// Flag a message
async function flagMessage(id) {
  await pool.query("UPDATE messages SET is_flagged = true WHERE id = $1", [id]);
}

module.exports = {
  getAllMessages,
  getMessageById,
  insertMessage,
  updateLikes,
  flagMessage,
};
