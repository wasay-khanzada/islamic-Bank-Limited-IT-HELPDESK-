// Validation middleware for registration and ticket creation

// Validate registration fields
exports.validateRegistration = (req, res, next) => {
  const { name, email, password, employeeId, branchCode, departmentId, designation } =
    req.body;

  // Required fields
  if (
    !name ||
    !email ||
    !password ||
    !employeeId ||
    !branchCode ||
    !departmentId ||
    !designation
  ) {
    return res.status(400).json({
      success: false,
      message:
        "name, email, password, employeeId, branchCode, departmentId, and designation are required",
    });
  }

  // Official email domain validation
  if (!/^[A-Za-z0-9._%+-]+@islamicbank\.com$/i.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Official Email must end with @islamicbank.com",
    });
  }

  // Validate employeeId format (exactly 5 digits)
  if (!/^\d{5}$/.test(employeeId)) {
    return res.status(400).json({
      success: false,
      message: "Employee ID must be exactly 5 digits (e.g., 12345)",
    });
  }

  // Validate departmentId
  if (!Number.isInteger(Number(departmentId)) || Number(departmentId) <= 0) {
    return res.status(400).json({
      success: false,
      message: "departmentId must be a valid positive integer",
    });
  }

  next();
};

// Validate ticket creation fields
exports.validateTicketCreate = (req, res, next) => {
  const { subject, description, categoryId, assetId } = req.body; // ← "subject" not "title"

  if (!subject || !description) {
    return res.status(400).json({
      success: false,
      message: "Subject and description are required", // ← updated message too
    });
  }

  if (categoryId !== undefined && categoryId !== null) {
    if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a valid positive integer",
      });
    }
  }

  if (assetId !== undefined && assetId !== null) {
    if (!Number.isInteger(Number(assetId)) || Number(assetId) <= 0) {
      return res.status(400).json({
        success: false,
        message: "assetId must be a valid positive integer",
      });
    }
  }

  next();
};