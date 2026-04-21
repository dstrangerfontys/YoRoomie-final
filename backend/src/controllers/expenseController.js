const pool = require("../config/db");

async function createExpense(req, res) {
    try {
        const { householdId, title, amount, paidByUserId } = req.body;

        if (!householdId || !title || !amount || !paidByUserId) {
            return res.status(400).json({
                message: "householdId, title, amount and paidByUserId are required",
            });
        }

        const [members] = await pool.query(
            "SELECT user_id FROM household_members WHERE household_id = ?",
            [householdId]
        );

        if (members.length === 0) {
            return res.status(404).json({ message: "No members found for this household" });
        }

        const numericAmount = Number(amount);
        const shareAmount = Number((numericAmount / members.length).toFixed(2));

        const [expenseResult] = await pool.query(
            "INSERT INTO expenses (household_id, title, amount, paid_by_user_id) VALUES (?, ?, ?, ?)",
            [householdId, title, numericAmount, paidByUserId]
        );

        const expenseId = expenseResult.insertId;

        for (const member of members) {
            await pool.query(
                "INSERT INTO expense_participants (expense_id, user_id, share_amount, is_settled) VALUES (?, ?, ?, ?)",
                [expenseId, member.user_id, shareAmount, false]
            );
        }

        res.status(201).json({
            message: "Expense created successfully",
            expense: {
                id: expenseId,
                householdId,
                title,
                amount: numericAmount,
                paidByUserId,
                splitBetween: members.length,
                shareAmount,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create expense",
            error: error.message,
        });
    }
}

async function getExpensesByHousehold(req, res) {
    try {
        const { householdId } = req.params;

        const [rows] = await pool.query(
            `SELECT 
         e.id,
         e.title,
         e.amount,
         e.paid_by_user_id,
         e.created_at,
         u.name AS paid_by_name
       FROM expenses e
       INNER JOIN users u ON u.id = e.paid_by_user_id
       WHERE e.household_id = ?
       ORDER BY e.created_at DESC`,
            [householdId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
}

module.exports = {
    createExpense,
    getExpensesByHousehold,
};