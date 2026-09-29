const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ===============================
// REGISTER USER
// ===============================
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Name, email, phone and password are required"
            });
        }

        const checkSql = "SELECT * FROM users WHERE email = ?";

        db.query(checkSql, [email], async (err, results) => {
            if (err) {
                console.error("Email check database error:", err);

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql =
                "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";

            db.query(
                insertSql,
                [name, email, phone, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("INSERT database error:", err);

                        return res.status(500).json({
                            message: "User registration failed",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully",
                        userId: result.insertId
                    });
                }
            );
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ===============================
// LOGIN USER
// ===============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("Login database error:", err);

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            // User not found
            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            // Compare entered password with hashed password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            // Login successful
            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Export functions
module.exports = {
    registerUser,
    loginUser
};