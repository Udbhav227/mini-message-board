const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { rateLimitAction } = require("../middleware/rateLimit");

router.get("/", messageController.getIndex);
router.get("/new", messageController.getNewMessage);
router.post("/new", messageController.createMessage);
router.get("/message/:id", messageController.getMessageDetails);
router.post(
  "/flag/:id",
  rateLimitAction("flag"),
  messageController.flagMessage,
);
router.post(
  "/like/:id",
  rateLimitAction("like"),
  messageController.likeMessage,
);

module.exports = router;
