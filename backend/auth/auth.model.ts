import mongoose from 'mongoose';

type User = {
    username: string;
    password: string;
    email: string;
    dob: Date;
    role: string;
    refreshToken: string[];
    enrollment_no: Number;
    status: string;
    lastActive: Date;
}

const UserSchema = new mongoose.Schema<User>(
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
type OtpType = {
    email: string;
    otp: number;
    expiresAt: Date;
    status: string;
}

const OtpSchema = new mongoose.Schema<OtpType>(
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
            default: new Date(Date.now() + 2 * 60 * 1000)
        },
        status: {
            type: String,
            enum: ["pending", "verified", "expired"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("users", UserSchema);
export const Otp = mongoose.model("otp", OtpSchema);