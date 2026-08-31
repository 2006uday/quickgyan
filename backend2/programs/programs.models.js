/**
 * Mongoose schema and model for Academic Programs (e.g., BCA, MCA, MBA, B.Tech).
 * Includes fields for program code, full name, description, total semesters, category, and status.
 */
import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        totalSemesters: {
            type: Number,
            required: true,
            default: 6,
            min: 1,
            max: 12
        },
        category: {
            type: String,
            enum: ["Undergraduate", "Postgraduate", "Diploma", "Certificate", "Doctorate", "Other"],
            default: "Undergraduate"
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("programs", programSchema);
