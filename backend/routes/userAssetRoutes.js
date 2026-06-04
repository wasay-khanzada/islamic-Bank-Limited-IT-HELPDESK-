const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { assignAsset } = require("../controllers/assetController");

router.post("/", authMiddleware, assignAsset);

module.exports = router;

