const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is not set. Add it to backend/.env");
    process.exit(1);
}

const signToken = (user) =>
    jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

// Requires a valid Bearer token; sets req.user = { id, role }
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const requireAdmin = [
    requireAuth,
    (req, res, next) => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    }
];

// The :userId in the URL / userId in the body must be the caller
// (admins may act on any user).
const requireSelf = (source = "params") => (req, res, next) => {
    const target = Number(req[source].userId);

    if (req.user.role === "admin" || target === req.user.id) {
        return next();
    }

    return res.status(403).json({ message: "You can only access your own data" });
};

module.exports = { signToken, requireAuth, requireAdmin, requireSelf };
