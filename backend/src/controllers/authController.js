const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Voer je naam, e-mailadres en gewenste wachtwoord in."
            });
        }

        const existingUsersResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        const existingUsers = existingUsersResult.rows;

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Het ingevoerde e-mailadres is reeds in gebruik."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
            [name, email, passwordHash]
        );

        const user = {
            id: result.rows[0].id,
            name,
            email,
        };

        res.status(201).json({
            message: "User registered successfully",
            user,
            token: generateToken(user),
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        const users = result.rows;

        if (users.length === 0) {
            return res.status(401).json({
                message: "Controleer je e-mailadres en wachtwoord."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Controleer je e-mailadres en wachtwoord."
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user),
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
}

module.exports = {
    register,
    login,
};
