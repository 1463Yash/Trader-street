const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email:     { type: String, required: true, index: true },
    otp:       { type: String, required: true },
    purpose:   { type: String, enum: ["register", "reset"], default: "register" },
    attempts:  { type: Number, default: 0 },   // wrong attempt counter
    createdAt: { type: Date, default: Date.now, expires: 120 }, // auto-delete after 2 min
});

// Only one active OTP per email+purpose at a time
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model("OTP", otpSchema);
