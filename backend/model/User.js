const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        verified: {
            type: Boolean,
            default: false,
        },
        watchlist: {
            type: [String],   // array of ticker symbols e.g. ["RELIANCE.NS", "TCS.NS"]
            default: [],
        },
    },
    { timestamps: true }   // adds createdAt + updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
// Mongoose will create a collection named "users" in Trader's_street DB
