const express = require("express");
const router = express.Router();
const crypto = require("crypto");

function formatDateTime(date) {
  const d = new Date(date);

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const datePart = d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  return `${time} ${datePart}`;
}

function generateId() {
  return crypto.randomUUID();
}

const messages = [
  {
    id: generateId(),
    user: "Emma",
    text: "Just thinking about old memories today...",
    likes: 45,
    date: new Date(),
  },
  {
    id: generateId(),
    user: "Aman",
    text: "Solo trip to the coast. Needed this.",
    likes: 77,
    date: new Date(),
  },
  {
    id: generateId(),
    user: "Sophia",
    text: "Rainy evenings hit different.",
    likes: 123,
    date: new Date(),
  },
  {
    id: generateId(),
    user: "Isha",
    text: "Sunsets make everything better.",
    likes: 72,
    date: new Date(),
  },
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

module.exports = router;
