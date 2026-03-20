import mongoose from "mongoose"

interface ICourse {
  "Course Code": string;
  "Course Name": string;
  "Credits": number;
  "Semester": number;
}

const courseSchema = new mongoose.Schema<ICourse>(
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
            type: Number,
            required: true
        }
    }
)

export default mongoose.model("courses", courseSchema);