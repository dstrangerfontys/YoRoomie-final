const pool = require("../config/db");

async function createTask(req, res) {
    try {
        const { householdId, title, description, assignedToUserId, dueDate } = req.body;

        if (!householdId || !title) {
            return res.status(400).json({
                message: "householdId and title are required",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO tasks (household_id, title, description, assigned_to_user_id, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'open')`,
            [
                householdId,
                title,
                description || null,
                assignedToUserId || null,
                dueDate || null,
            ]
        );

        res.status(201).json({
            message: "Task created successfully",
            task: {
                id: result.insertId,
                householdId,
                title,
                description,
                assignedToUserId,
                dueDate,
                status: "open",
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message,
        });
    }
}

async function getTasksByHousehold(req, res) {
    try {
        const { householdId } = req.params;

        const [rows] = await pool.query(
            `SELECT
         t.id,
         t.title,
         t.description,
         t.status,
         t.due_date,
         t.assigned_to_user_id,
         u.name AS assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to_user_id
       WHERE t.household_id = ?
       ORDER BY t.created_at DESC`,
            [householdId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message,
        });
    }
}

async function completeTask(req, res) {
    try {
        const { taskId } = req.params;

        const [result] = await pool.query(
            "UPDATE tasks SET status = 'done' WHERE id = ?",
            [taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task marked as done" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to complete task",
            error: error.message,
        });
    }
}

module.exports = {
    createTask,
    getTasksByHousehold,
    completeTask,
};