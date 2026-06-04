const { Asset, UserAsset, User } = require("../models");

// GET /api/assets
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: assets });
  } catch (err) {
    console.error("getAssets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assets/my - Get assets assigned to current user
exports.getMyAssets = async (req, res) => {
  try {
    const userAssets = await UserAsset.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Asset,
          as: "asset",
        },
      ],
    });

    const assets = userAssets.map((ua) => ua.asset);
    res.json({ success: true, data: assets });
  } catch (err) {
    console.error("getMyAssets error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/user-assets — assign an asset to a user
exports.assignAsset = async (req, res) => {
  try {
    // Only admin/super_admin can assign assets
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const { userId, assetId } = req.body;

    if (!userId || !assetId) {
      return res.status(400).json({
        success: false,
        message: "userId and assetId are required",
      });
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify asset exists
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res
        .status(404)
        .json({ success: false, message: "Asset not found" });
    }

    // Check if already assigned
    const existing = await UserAsset.findOne({
      where: { userId, assetId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Asset is already assigned to this user",
      });
    }

    const userAsset = await UserAsset.create({ userId, assetId });

    res.status(201).json({
      success: true,
      message: "Asset assigned successfully",
      data: userAsset,
    });
  } catch (err) {
    console.error("assignAsset error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
