function normalizeDesignation(input) {
  return String(input || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function computeRole({ departmentName, designation, employeeId }) {
  const key = normalizeDesignation(designation);

  // Superadmin is strictly based on position SEVPI and employeeId 42478
  if (key === "SEVPI" && employeeId === "42478") {
    return "super_admin";
  }

  // If department is not IT → always user
  if (!departmentName || String(departmentName).toUpperCase() !== "IT") {
    return "user";
  }

  // Admin is strictly SEVPII in the IT Department
  if (key === "SEVPII") {
    return "admin";
  }

  // All other IT department members are agents
  return "agent";
}

module.exports = { computeRole };

