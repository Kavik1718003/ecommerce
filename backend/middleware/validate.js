// Small validation helpers shared by controllers.

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isEmail = (v) => typeof v === "string" && v.length <= 150 && EMAIL_RE.test(v);
const isPhone = (v) => typeof v === "string" && /^[0-9+\-\s]{7,15}$/.test(v);
const isPincode = (v) => typeof v === "string" && /^[0-9]{5,8}$/.test(v);

const str = (v, max = 255) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Parse a positive/non-negative integer with clamping; returns fallback if invalid
const int = (v, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) => {
    const n = Number.parseInt(v, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(Math.max(n, min), max);
};

const num = (v, fallback = null) => {
    const n = Number(v);
    return v === undefined || v === "" || Number.isNaN(n) ? fallback : n;
};

const PAYMENT_METHODS = ["Cash on Delivery", "UPI", "Card"];

// Free delivery above the threshold, flat fee otherwise
const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 49;
const shippingFor = (itemsTotal) => (itemsTotal >= FREE_SHIPPING_MIN || itemsTotal <= 0 ? 0 : SHIPPING_FEE);

const ORDER_STATUSES = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

module.exports = {
    HttpError, isEmail, isPhone, isPincode, str, int, num,
    PAYMENT_METHODS, ORDER_STATUSES, FREE_SHIPPING_MIN, SHIPPING_FEE, shippingFor
};
