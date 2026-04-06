/**
 * This file defines the Mongoose schema and model for academic courses.
 * It includes fields for course identification, credits, and semester associations.
 */
import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
    {
        "Course Code": {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        "Course Name": {
            type: String,
            required: true,
            trim: true
        },
        "Credits": {
            type: Number,
            required: true
        },
        "Semester": {
            type: String,
            required: true
        }
    }
)

export default mongoose.model("courses", courseSchema);