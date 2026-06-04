// backend/controllers/departmentController.js
// 
// KEY LOGIC:
// All tickets have departmentId=1 (IT) because they're routed to IT.
// But tickets are CREATED by users who belong to other departments
// (Branch Banking, Finance, HR, Operations).
// 
// So we group all metrics by the CREATOR's departmentId (u.departmentId),
// not the ticket's own departmentId.
//
// "Agents" for a dept = distinct agents assigned to tickets created by that dept's users.
// "Open Tickets"      = tickets created by that dept's users, status open/in-progress.
// "Resolved (Month)"  = tickets created by that dept's users, resolved/closed this month.
// "Resolution Rate"   = all-time resolved / all-time total for that dept's users' tickets.

const { Department, sequelize } = require("../models");

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [["name", "ASC"]],
    });

    const now             = new Date();
    const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);

    // 1. Distinct agents working on tickets, grouped by CREATOR's department
    const [agentRows] = await sequelize.query(`
      SELECT u.[departmentId] AS deptId, COUNT(DISTINCT t.[assignedToId]) AS cnt
      FROM [Tickets] t
      JOIN [Users] u ON u.[id] = t.[userId]
      WHERE t.[assignedToId] IS NOT NULL
        AND u.[departmentId] IS NOT NULL
      GROUP BY u.[departmentId]
    `);

    // 2. Open / In-Progress tickets grouped by CREATOR's department
    const [openRows] = await sequelize.query(`
      SELECT u.[departmentId] AS deptId, COUNT(*) AS cnt
      FROM [Tickets] t
      JOIN [Users] u ON u.[id] = t.[userId]
      WHERE t.[status] IN ('open', 'in-progress')
        AND u.[departmentId] IS NOT NULL
      GROUP BY u.[departmentId]
    `);

    // 3. Resolved/Closed THIS month grouped by CREATOR's department
    const [resolvedMonthRows] = await sequelize.query(`
      SELECT u.[departmentId] AS deptId, COUNT(*) AS cnt
      FROM [Tickets] t
      JOIN [Users] u ON u.[id] = t.[userId]
      WHERE t.[status] IN ('resolved', 'closed')
        AND u.[departmentId] IS NOT NULL
        AND t.[updatedAt] >= '${startOfMonthStr}'
      GROUP BY u.[departmentId]
    `);

    // 4. All-time resolved/closed grouped by CREATOR's department
    const [resolvedAllRows] = await sequelize.query(`
      SELECT u.[departmentId] AS deptId, COUNT(*) AS cnt
      FROM [Tickets] t
      JOIN [Users] u ON u.[id] = t.[userId]
      WHERE t.[status] IN ('resolved', 'closed')
        AND u.[departmentId] IS NOT NULL
      GROUP BY u.[departmentId]
    `);

    // 5. All-time total tickets grouped by CREATOR's department
    const [totalAllRows] = await sequelize.query(`
      SELECT u.[departmentId] AS deptId, COUNT(*) AS cnt
      FROM [Tickets] t
      JOIN [Users] u ON u.[id] = t.[userId]
      WHERE u.[departmentId] IS NOT NULL
      GROUP BY u.[departmentId]
    `);

    // Index all result sets by deptId for O(1) lookup
    const toMap = (rows) =>
      Object.fromEntries(rows.map((r) => [String(r.deptId), Number(r.cnt)]));

    const agentMap       = toMap(agentRows);
    const openMap        = toMap(openRows);
    const resolvedMonMap = toMap(resolvedMonthRows);
    const resolvedAllMap = toMap(resolvedAllRows);
    const totalAllMap    = toMap(totalAllRows);

    const enriched = departments.map((dept) => {
      const plain           = dept.get({ plain: true });
      const key             = String(dept.id);
      const agentCount      = agentMap[key]       ?? 0;
      const openTickets     = openMap[key]        ?? 0;
      const resolvedCount   = resolvedMonMap[key] ?? 0;
      const resolvedAllTime = resolvedAllMap[key] ?? 0;
      const totalTickets    = totalAllMap[key]    ?? 0;

      console.log(
        `[dept ${dept.id} "${dept.name}"] ` +
        `agents=${agentCount} open=${openTickets} ` +
        `resolved(month)=${resolvedCount} resolved(all)=${resolvedAllTime} ` +
        `total=${totalTickets}`
      );

      return {
        ...plain,
        agentCount,
        openTickets,
        resolvedCount,
        resolvedAllTime,
        totalTickets,
        status: "active",
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("getDepartments error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};