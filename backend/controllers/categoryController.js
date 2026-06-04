const { Category } = require("../models");

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
