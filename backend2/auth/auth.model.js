import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        username:
        {
            type: String,
            required: true,
            trim: true
        },
        password:
        {
            type: String,
            required: true,
        },
        email:
        {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        dob:
        {
            type: Date,
            default: new Date()
        },
        enrollment_no:
        {
            type: Number,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },
        role:
        {
            type: String,
            default: "user"
        },
        refreshToken:
        {
            type: [String],
            default: []
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

const OtpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
        },
        otp: {
            type: Number,
            required: true,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 1000)
        },
        status: {
            type: String,
            enum: ["pending", "verified", "expired"],
            default: "pending"
        },
        userData: {
            type: Object,
            default: null
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("users", UserSchema);
export const Otp = mongoose.model("otp", OtpSchema);