
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const courseSchema = new mongoose.Schema({
    "Course Code": String,
    "Course Name": String,
    "Credits": Number,
    "Semester": String
});

const resourceSchema = new mongoose.Schema({
    resourceTitle: String,
    semester: String,
    course: String
}, { collection: 'Resources' });

const Course = mongoose.model("courses", courseSchema);
const Resource = mongoose.model("Resources", resourceSchema);

async function checkData() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const courses = await Course.find();
        console.log("Total Courses:", courses.length);
        if (courses.length > 0) {
            console.log("Sample Course:", JSON.stringify(courses[0], null, 2));
        }

        const resources = await Resource.find();
        console.log("Total Resources:", resources.length);
        if (resources.length > 0) {
            console.log("Sample Resource:", JSON.stringify(resources[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkData();
