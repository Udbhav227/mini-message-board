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
function generateId() {
  return crypto.randomUUID();
}

const messages = [
  {
    id: generateId(),
    user: "corvo",
    text: "say what you couldn't say out loud.",
    likes: 7,
    liked: true,
    date: new Date(),
  }
];

router.get("/", (req, res) => {
  res.render("index", { messages, formatDateTime });
});

router.get("/new", (req, res) => {
  res.render("new");
});

router.post("/new", (req, res) => {
  const { messageUser, messageText } = req.body;

  messages.unshift({
    id: generateId(),
    user: messageUser,
    text: messageText,
    likes: 0,
    liked: false,
    date: new Date(),
  });

  res.redirect("/");
});

router.get("/message/:id", (req, res) => {
  const id = req.params.id;

  const message = messages.find((msg) => msg.id === id);

  if (message) {
    res.render("message", { message, formatDateTime });
  } else {
    res.status(404).send("ENTRY NOT FOUND.");
  }
});

router.post("/like/:id", (req, res) => {
  const id = req.params.id;

  const message = messages.find((msg) => msg.id === id);
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (message.liked) {
    message.likes = Math.max(0, message.likes - 1);
    message.liked = false;
  } else {
    message.likes += 1;
    message.liked = true;
  }

  res.json({
    likes: message.likes,
    liked: message.liked,
  });
});

module.exports = router;
