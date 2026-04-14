const pool = require("../config/db");

function generateInviteCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function createHousehold(req, res) {
    try {
        const { name, userId } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ message: "Name and userId are required" });
        }

        const inviteCode = generateInviteCode();

        const [result] = await pool.query(
            "INSERT INTO households (name, invite_code, created_by_user_id) VALUES (?, ?, ?)",
            [name, inviteCode, userId]
        );

        const householdId = result.insertId;

        await pool.query(
            "INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)",
            [householdId, userId, "owner"]
        );

        res.status(201).json({
            message: "Household created successfully",
            household: {
                id: householdId,
                name,
                inviteCode,
                createdByUserId: userId,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create household",
            error: error.message,
        });
    }
}

async function getUserHouseholds(req, res) {
    try {
        const { userId } = req.params;

        const [rows] = await pool.query(
            `SELECT h.id, h.name, h.invite_code
       FROM households h
       INNER JOIN household_members hm ON hm.household_id = h.id
       WHERE hm.user_id = ?`,
            [userId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch households",
            error: error.message,
        });
    }
}

async function joinHousehold(req, res) {
    try {
        const { inviteCode, userId } = req.body;

        if (!inviteCode || !userId) {
            return res.status(400).json({ message: "inviteCode and userId are required" });
        }

        const [households] = await pool.query(
            "SELECT id, name, invite_code FROM households WHERE invite_code = ?",
            [inviteCode]
        );

        if (households.length === 0) {
            return res.status(404).json({ message: "Household not found" });
        }

        const household = households[0];

        const [existingMembership] = await pool.query(
            "SELECT id FROM household_members WHERE household_id = ? AND user_id = ?",
            [household.id, userId]
        );

        if (existingMembership.length > 0) {
            return res.status(409).json({ message: "User is already a member of this household" });
        }

        await pool.query(
            "INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)",
            [household.id, userId, "member"]
        );

        res.json({
            message: "Joined household successfully",
            household: {
                id: household.id,
                name: household.name,
                inviteCode: household.invite_code,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to join household",
            error: error.message,
        });
    }
}

module.exports = {
    createHousehold,
    getUserHouseholds,
};