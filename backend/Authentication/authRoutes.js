const express          = require("express");
const bcrypt           = require("bcryptjs");
const jwt              = require("jsonwebtoken");
const connectMongoose  = require("../mongoDB/mongoose");
const User             = require("../model/User");
const sendOTP          = require("./Emailsending");

const router = express.Router();

// Connect mongoose when this module loads
connectMongoose();

// In-memory OTP store  { email: { otp, expiresAt } }
const otpStore = {};

const sign = (user) =>
    jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: "All fields are required" });

        if (await User.findOne({ email }))
            return res.status(409).json({ error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed });

        const { OTP } = await sendOTP(email);
        otpStore[email] = { otp: OTP, expiresAt: Date.now() + 2 * 60 * 1000 };

        res.json({ message: "Registered. OTP sent to your email." });
    } catch (err) { next(err); }
});

// ── POST /auth/verify-otp ─────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore[email];

        if (!record)
            return res.status(400).json({ error: "No OTP found for this email" });
        if (Date.now() > record.expiresAt) {
            delete otpStore[email];
            return res.status(400).json({ error: "OTP expired. Please register again." });
        }
        if (String(record.otp) !== String(otp))
            return res.status(400).json({ error: "Invalid OTP" });

        delete otpStore[email];
        const user = await User.findOneAndUpdate({ email }, { verified: true }, { new: true });
        const token = sign(user);

        res.json({ message: "Email verified successfully", token, user: { name: user.name, email: user.email } });
    } catch (err) { next(err); }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: "Invalid email or password" });

        if (!user.verified)
            return res.status(403).json({ error: "Email not verified. Check your inbox for the OTP." });

        res.json({ token: sign(user), user: { name: user.name, email: user.email } });
    } catch (err) { next(err); }
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
router.post("/forgot-password", async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "No account found with this email" });

        const { OTP } = await sendOTP(email);
        otpStore[email] = { otp: OTP, expiresAt: Date.now() + 2 * 60 * 1000 };

        res.json({ message: "OTP sent to your email" });
    } catch (err) { next(err); }
});

// ── POST /auth/reset-password ─────────────────────────────────────────────────
router.post("/reset-password", async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const record = otpStore[email];

        if (!record)
            return res.status(400).json({ error: "No OTP found" });
        if (Date.now() > record.expiresAt) {
            delete otpStore[email];
            return res.status(400).json({ error: "OTP expired" });
        }
        if (String(record.otp) !== String(otp))
            return res.status(400).json({ error: "Invalid OTP" });

        delete otpStore[email];
        await User.findOneAndUpdate({ email }, { password: await bcrypt.hash(newPassword, 10) });

        res.json({ message: "Password reset successful. Please login." });
    } catch (err) { next(err); }
});

// ── GET /auth/me (protected) ──────────────────────────────────────────────────
router.get("/me", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token provided" });
    try {
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        res.json({ user: { name: decoded.name, email: decoded.email } });
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

module.exports = router;

// ── Auth middleware helper ────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Login required" });
    try {
        req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ user: { name: user.name, email: user.email, watchlist: user.watchlist } });
    } catch (err) { next(err); }
});

// ── GET /auth/watchlist ───────────────────────────────────────────────────────
router.get("/watchlist", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("watchlist");
        res.json({ watchlist: user.watchlist });
    } catch (err) { next(err); }
});

// ── POST /auth/watchlist/add ──────────────────────────────────────────────────
router.post("/watchlist/add", authMiddleware, async (req, res, next) => {
    try {
        const { symbol } = req.body;
        if (!symbol) return res.status(400).json({ error: "Symbol required" });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { watchlist: symbol } },  // addToSet prevents duplicates
            { new: true }
        ).select("watchlist");

        res.json({ watchlist: user.watchlist });
    } catch (err) { next(err); }
});

// ── POST /auth/watchlist/remove ───────────────────────────────────────────────
router.post("/watchlist/remove", authMiddleware, async (req, res, next) => {
    try {
        const { symbol } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { watchlist: symbol } },
            { new: true }
        ).select("watchlist");

        res.json({ watchlist: user.watchlist });
    } catch (err) { next(err); }
});

module.exports = router;
