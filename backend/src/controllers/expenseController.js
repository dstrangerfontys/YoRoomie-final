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

async function getBalancesByHousehold(req, res) {
    try {
        const { householdId } = req.params;

        const [rows] = await pool.query(
            `
      SELECT
        u.id AS userId,
        u.name,

        COALESCE((
          SELECT SUM(e.amount)
          FROM expenses e
          WHERE e.household_id = ?
          AND e.paid_by_user_id = u.id
        ), 0) AS paidTotal,

        COALESCE((
          SELECT SUM(ep.share_amount)
          FROM expense_participants ep
          INNER JOIN expenses e ON e.id = ep.expense_id
          WHERE e.household_id = ?
          AND ep.user_id = u.id
        ), 0) AS owesTotal

      FROM users u
      INNER JOIN household_members hm ON hm.user_id = u.id
      WHERE hm.household_id = ?
      `,
            [householdId, householdId, householdId]
        );

        const balances = rows.map((row) => {
            const paidTotal = Number(row.paidTotal);
            const owesTotal = Number(row.owesTotal);

            return {
                userId: row.userId,
                name: row.name,
                paidTotal,
                owesTotal,
                balance: Number((paidTotal - owesTotal).toFixed(2)),
            };
        });

        res.json(balances);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch balances",
            error: error.message,
        });
    }
}

async function getExpenseParticipants(req, res) {
    try {
        const { expenseId } = req.params;

        const [rows] = await pool.query(
            `SELECT
         ep.id,
         ep.expense_id,
         ep.user_id,
         u.name,
         ep.share_amount,
         ep.is_settled
       FROM expense_participants ep
       INNER JOIN users u ON u.id = ep.user_id
       WHERE ep.expense_id = ?
       ORDER BY u.name ASC`,
            [expenseId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch expense participants",
            error: error.message,
        });
    }
}

async function settleParticipant(req, res) {
    try {
        const { participantId } = req.params;

        const [result] = await pool.query(
            "UPDATE expense_participants SET is_settled = 1 WHERE id = ?",
            [participantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Participant not found" });
        }

        res.json({ message: "Participant marked as settled" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to settle participant",
            error: error.message,
        });
    }
}

async function getSettlementsByHousehold(req, res) {
    try {
        const { householdId } = req.params;

        const [rows] = await pool.query(
            `
      SELECT
        u.id AS userId,
        u.name,

        COALESCE((
          SELECT SUM(e.amount)
          FROM expenses e
          WHERE e.household_id = ?
          AND e.paid_by_user_id = u.id
        ), 0) AS paidTotal,

        COALESCE((
          SELECT SUM(ep.share_amount)
          FROM expense_participants ep
          INNER JOIN expenses e ON e.id = ep.expense_id
          WHERE e.household_id = ?
          AND ep.user_id = u.id
        ), 0) AS owesTotal

      FROM users u
      INNER JOIN household_members hm ON hm.user_id = u.id
      WHERE hm.household_id = ?
      `,
            [householdId, householdId, householdId]
        );

        const balances = rows.map((row) => {
            const paidTotal = Number(row.paidTotal);
            const owesTotal = Number(row.owesTotal);

            return {
                userId: row.userId,
                name: row.name,
                balance: Number((paidTotal - owesTotal).toFixed(2)),
            };
        });

        const creditors = balances
            .filter((b) => b.balance > 0)
            .map((b) => ({ ...b }));

        const debtors = balances
            .filter((b) => b.balance < 0)
            .map((b) => ({ ...b, balance: Math.abs(b.balance) }));

        const settlements = [];

        let debtorIndex = 0;
        let creditorIndex = 0;

        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];

            const amount = Math.min(debtor.balance, creditor.balance);

            if (amount > 0) {
                settlements.push({
                    fromUserId: debtor.userId,
                    fromName: debtor.name,
                    toUserId: creditor.userId,
                    toName: creditor.name,
                    amount: Number(amount.toFixed(2)),
                });
            }

            debtor.balance = Number((debtor.balance - amount).toFixed(2));
            creditor.balance = Number((creditor.balance - amount).toFixed(2));

            if (debtor.balance <= 0) debtorIndex++;
            if (creditor.balance <= 0) creditorIndex++;
        }

        res.json({
            balances,
            settlements,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch settlements",
            error: error.message,
        });
    }
}

module.exports = {
    createExpense,
    getExpensesByHousehold,
    getBalancesByHousehold,
    getExpenseParticipants,
    settleParticipant,
    getSettlementsByHousehold,
};