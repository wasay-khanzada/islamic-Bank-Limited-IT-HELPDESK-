const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAssets, getMyAssets } = require("../controllers/assetController");

router.get("/", authMiddleware, getAssets);
router.get("/my", authMiddleware, getMyAssets);

module.exports = router;

