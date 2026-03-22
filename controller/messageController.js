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
  const messages = await db.getAllMessages();
  res.render("index", { messages: messages, formatDateTime: formatDateTime });
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
    .withMessage("Author name cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("Author name must be under 50 characters.")
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
      return res.status(400).render("new", {
        errors: errors.array(),
      });
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
    res.render("message", { message: message, formatDateTime: formatDateTime });
  } else {
    res.status(404).send("Message not found.");
  }
}

// POST /flag/:id
async function flagMessage(req, res) {
  const id = parseInt(req.params.id, 10);
  try {
    const newFlagsCount = await db.updateFlags(id, 1);

    if (newFlagsCount >= 5) {
      console.log(`Message ${id} has reached 5 flags! Time to hide it.`);
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error flagging message.");
  }
}

module.exports = {
  getIndex,
  getNewMessage,
  createMessage,
  getMessageDetails,
  flagMessage,
};
