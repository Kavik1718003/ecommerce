const bcrypt = require("bcryptjs");
const db = require("../config/db").promise();
const { signToken } = require("../middleware/authMiddleware");
const { HttpError, isEmail, isPhone, isPincode, str } = require("../middleware/validate");

const publicUser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    address: u.address || "",
    city: u.city || "",
    state: u.state || "",
    pincode: u.pincode || ""
});

// POST /api/auth/register
const registerUser = async (req, res) => {
    const name = str(req.body.name, 100);
    const email = str(req.body.email, 150).toLowerCase();
    const phone = str(req.body.phone, 20);
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2) throw new HttpError(400, "Please enter your full name");
    if (!isEmail(email)) throw new HttpError(400, "Please enter a valid email address");
    if (!isPhone(phone)) throw new HttpError(400, "Please enter a valid phone number");
    if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters");

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) throw new HttpError(409, "An account with this email already exists");

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
        "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
        [name, email, phone, hash]
    );

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    const email = str(req.body.email, 150).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError(401, "Invalid email or password");
    }

    res.json({ message: "Login successful", token: signToken(user), user: publicUser(user) });
};

// GET /api/auth/me
const getMe = async (req, res) => {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) throw new HttpError(404, "User not found");
    res.json({ user: publicUser(rows[0]) });
};

// PUT /api/auth/me  (name, phone, saved address)
const updateMe = async (req, res) => {
    const name = str(req.body.name, 100);
    const phone = str(req.body.phone, 20);
    const address = str(req.body.address, 255);
    const city = str(req.body.city, 100);
    const state = str(req.body.state, 100);
    const pincode = str(req.body.pincode, 10);

    if (name.length < 2) throw new HttpError(400, "Please enter your full name");
    if (!isPhone(phone)) throw new HttpError(400, "Please enter a valid phone number");
    if (pincode && !isPincode(pincode)) throw new HttpError(400, "Please enter a valid pincode");

    await db.query(
        "UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?",
        [name, phone, address || null, city || null, state || null, pincode || null, req.user.id]
    );

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    res.json({ message: "Profile updated", user: publicUser(rows[0]) });
};

// PUT /api/auth/password
const changePassword = async (req, res) => {
    const current = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
    const next = typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (next.length < 8) throw new HttpError(400, "New password must be at least 8 characters");

    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) throw new HttpError(404, "User not found");

    if (!(await bcrypt.compare(current, rows[0].password))) {
        throw new HttpError(400, "Current password is incorrect");
    }

    await db.query("UPDATE users SET password = ? WHERE id = ?", [await bcrypt.hash(next, 10), req.user.id]);
    res.json({ message: "Password changed successfully" });
};

module.exports = { registerUser, loginUser, getMe, updateMe, changePassword, publicUser };
