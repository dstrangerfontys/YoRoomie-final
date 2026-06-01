const pool = require("../config/db");

async function createTask(req, res) {
    try {
        const { householdId, title, description, dueDate } = req.body;

        if (!householdId || !title) {
            return res.status(400).json({
                message: "householdId and title are required",
            });
        }

        const [members] = await pool.query(
            `
      SELECT
        hm.user_id,
        u.name,
        COUNT(t.id) AS taskCount
      FROM household_members hm
      INNER JOIN users u ON u.id = hm.user_id
      LEFT JOIN tasks t 
        ON t.assigned_to_user_id = hm.user_id 
        AND t.household_id = hm.household_id
      WHERE hm.household_id = ?
      GROUP BY hm.user_id, u.name
      `,
            [householdId]
        );

        if (members.length === 0) {
            return res.status(404).json({
                message: "No household members found",
            });
        }

        const minTaskCount = Math.min(
            ...members.map((member) => Number(member.taskCount))
        );

        const eligibleMembers = members.filter(
            (member) => Number(member.taskCount) === minTaskCount
        );

        const randomMember =
            eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];

        const assignedToUserId = randomMember.user_id;

        const [result] = await pool.query(
            `INSERT INTO tasks 
       (household_id, title, description, assigned_to_user_id, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'open')`,
            [
                householdId,
                title,
                description || null,
                assignedToUserId,
                dueDate || null,
            ]
        );

        res.status(201).json({
            message: `Task created and assigned to ${randomMember.name}`,
            task: {
                id: result.insertId,
                householdId,
                title,
                description,
                assignedToUserId,
                assignedToName: randomMember.name,
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
         u.name AS assigned_to_name,
         u.avatar_image AS assigned_to_avatar
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

async function updateTask(req, res) {
    try {
        const { taskId } = req.params;
        const { title, description, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const [result] = await pool.query(
            `UPDATE tasks
       SET title = ?, description = ?, due_date = ?
       WHERE id = ?`,
            [title, description || null, dueDate || null, taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message,
        });
    }
}

async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;

        const [result] = await pool.query(
            "DELETE FROM tasks WHERE id = ?",
            [taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task",
            error: error.message,
        });
    }
}

module.exports = {
    createTask,
    getTasksByHousehold,
    completeTask,
    deleteTask,
    updateTask,
};