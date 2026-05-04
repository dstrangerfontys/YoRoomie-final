const pool = require("../config/db");

async function createGrocery(req, res) {
    try {
        const { householdId, title, quantity, addedByUserId } = req.body;

        if (!householdId || !title || !addedByUserId) {
            return res.status(400).json({
                message: "householdId, title and addedByUserId are required",
            });
        }

        const [result] = await pool.query(
            `INSERT INTO groceries (household_id, title, quantity, added_by_user_id, status)
       VALUES (?, ?, ?, ?, 'open')`,
            [householdId, title, quantity || null, addedByUserId]
        );

        res.status(201).json({
            message: "Grocery item created successfully",
            grocery: {
                id: result.insertId,
                householdId,
                title,
                quantity,
                addedByUserId,
                status: "open",
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create grocery item",
            error: error.message,
        });
    }
}

async function getGroceriesByHousehold(req, res) {
    try {
        const { householdId } = req.params;

        const [rows] = await pool.query(
            `SELECT
         g.id,
         g.title,
         g.quantity,
         g.status,
         g.created_at,
         g.added_by_user_id,
         u.name AS added_by_name
       FROM groceries g
       LEFT JOIN users u ON u.id = g.added_by_user_id
       WHERE g.household_id = ?
       ORDER BY g.created_at DESC`,
            [householdId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch grocery items",
            error: error.message,
        });
    }
}

async function completeGrocery(req, res) {
    try {
        const { itemId } = req.params;

        const [result] = await pool.query(
            "UPDATE groceries SET status = 'done' WHERE id = ?",
            [itemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Grocery item not found" });
        }

        res.json({ message: "Grocery item marked as done" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to complete grocery item",
            error: error.message,
        });
    }
}

module.exports = {
    createGrocery,
    getGroceriesByHousehold,
    completeGrocery,
};