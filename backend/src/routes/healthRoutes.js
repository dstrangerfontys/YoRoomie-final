const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS ok");
        res.json({
            message: "API is working",
            database: rows[0].ok === 1 ? "connected" : "not connected",
        });
    } catch (error) {
        res.status(500).json({
            message: "API is running but database failed",
            error: error.message,
        });
    }
});

module.exports = router;