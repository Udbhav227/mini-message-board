const express = require("express");
const router = express.Router();

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

const messages = [
  {
    user: "Adam",
    text: "Just thinking about old memories today...",
    likes: 45,
    date: new Date(),
  },
  {
    user: "Aman",
    text: "Spontaneous trip to the coast. Needed this.",
    likes: 77,
    date: new Date(),
  },
  {
    user: "Erik",
    text: "Late night coffee and lo-fi beats. Perfect.",
    likes: 123,
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
    user: messageUser,
    text: messageText,
    likes: 0,
    date: new Date(),
  });

  res.redirect("/");
});

module.exports = router;
