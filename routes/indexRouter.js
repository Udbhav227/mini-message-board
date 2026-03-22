const express = require("express");
const router = express.Router();
const crypto = require("crypto");

function formatDateTime(date) {
  const d = new Date(date);

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const datePart = d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return `${time} ${datePart}`;
}

const validateMessage = [
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
];

router.get("/", async (req, res) => {
  const messages = await db.getAllMessages();
  res.render("index", { messages, formatDateTime });
});

router.get("/new", (req, res) => {
  res.render("new", {errors: null});
});

router.post("/new", validateMessage, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("new", {
      errors: errors.array(),
    });
  }

  const { messageUser, messageText } = req.body;
  await db.insertMessage(messageUser, messageText);
  res.redirect("/");
});

router.get("/message/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const message = await db.getMessageById(id);

  if (message) {
    res.render("message", { message, formatDateTime });
  } else {
    res.status(404).send("ENTRY NOT FOUND.");
  }
});

router.post("/like/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  try {
    const newLikesCount = await db.updateLikes(id, 1);
    res.json({
      likes: newLikesCount,
      liked: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update like" });
  }
});

module.exports = router;
