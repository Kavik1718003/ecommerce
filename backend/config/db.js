require("dotenv").config();

const mysql = require("mysql2");

// A pool (not a single connection) so idle timeouts and dropped
// connections don't take the API down. Same callback API as before.
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cartiva",
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");
    connection.release();
});

module.exports = db;
