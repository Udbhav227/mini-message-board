const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/", messageController.getIndex);
router.get("/new", messageController.getNewMessage);
router.post("/new", messageController.createMessage);
router.get("/message/:id", messageController.getMessageDetails);
router.post("/flag/:id", messageController.flagMessage);
router.post("/like/:id", messageController.likeMessage);

module.exports = router;
