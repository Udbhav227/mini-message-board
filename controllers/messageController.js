const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

function formatDateTime(date) {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// GET /
async function getIndex(req, res) {
  // Read ?sort= from query string, default to "hot"
  const sort = req.query.sort || "hot";
  const messages = await db.getAllMessages(sort);

  const notice = req.query.rateLimited
    ? `You already ${req.query.rateLimited}d this recently.`
    : null;

  res.render("index", { messages, formatDateTime, notice, sort });
}

// GET /new
function getNewMessage(req, res) {
  res.render("new", { errors: null });
}

// POST /new
const createMessage = [
  body("messageUser")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("Name must be under 50 characters.")
    .escape(),
  body("messageText")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty.")
    .isLength({ max: 120 })
    .withMessage("Message must be under 120 characters.")
    .escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("new", { errors: errors.array() });
    }
    const { messageUser, messageText } = req.body;
    await db.insertMessage(messageUser, messageText);
    res.redirect("/");
  },
];

// GET /message/:id
async function getMessageDetails(req, res) {
  const id = parseInt(req.params.id, 10);
  const message = await db.getMessageById(id);
  if (message) {
    res.render("message", { message, formatDateTime });
  } else {
    res.status(404).send("Not found.");
  }
}

// POST /flag/:id
async function flagMessage(req, res) {
  const id = parseInt(req.params.id, 10);
  const sort = req.query.sort || "hot";
  try {
    const newFlags = await db.updateFlags(id, 1);
    if (newFlags >= 5) {
      console.log(`Post ${id} has ${newFlags} flags — consider removing.`);
    }
    res.redirect(`/?sort=${sort}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error flagging post.");
  }
}

// POST /like/:id
async function likeMessage(req, res) {
  const id = parseInt(req.params.id, 10);
  const currentlyLiked = req.body.liked === "true";
  const delta = currentlyLiked ? -1 : 1;

  try {
    const newLikes = await db.updateLikes(id, delta);
    res.json({ likes: newLikes, liked: !currentlyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update like." });
  }
}

module.exports = {
  getIndex,
  getNewMessage,
  createMessage,
  getMessageDetails,
  flagMessage,
  likeMessage,
};
