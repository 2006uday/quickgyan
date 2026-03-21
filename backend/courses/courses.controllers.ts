import courseSchema from "./courses.models";
import { Request, Response } from "express";
import { User } from "../auth/auth.model";
import Notification from "../notifications/notification.models";

async function createCourseNotifications(courseNames: string[]) {
    try {
        const users = await User.find({ status: "active" }, "_id");
        if (users.length === 0) return;

        const notifications = users.flatMap(user => 
            courseNames.map(name => ({
                userId: user._id,
                title: "New Course Added",
                message: `An exciting new course "${name}" has been added to the curriculum. Check it out!`,
                type: "info"
            }))
        );

        // To avoid overwhelming users if many courses are added at once, 
        // maybe just one notification for the batch?
        // Let's do one notification if multiple courses are added.
        
        const summaryMessage = courseNames.length === 1 
            ? `A new course "${courseNames[0]}" has been added.` 
            : `${courseNames.length} new courses have been added, including "${courseNames[0]}".`;

        const singleNotifications = users.map(user => ({
            userId: user._id,
            title: "New Courses Available",
            message: summaryMessage,
            type: "info"
        }));

        await Notification.insertMany(singleNotifications);
        console.log(`Course notifications created for ${users.length} users`);
    } catch (error) {
        console.error("Error creating course notifications:", error);
    }
}

// add courses data
async function addCourse(req: any, res: any) {
    try {
        console.log("Incoming request body:", req.body);

        if (!req.body) {
            return res.status(400).json({ message: "Request body is required" });
        }

        // Handle both single object and array of objects
        const items = Array.isArray(req.body) ? req.body : [req.body];

        // Map frontend field names to backend Schema format
        const coursesToInsert = items.map(item => ({
            "Course Name": item.courseName,
            "Course Code": item.courseCode,
            "Credits": item.credits,
            "Semester": item.semester
        }));

        // Validation: Verify all required fields for each item
        for (const course of coursesToInsert) {
            if (!course["Course Name"] || !course["Course Code"] || course.Credits === undefined || course.Semester === undefined) {
                return res.status(400).json({
                    message: "All fields are required for each course (courseName, courseCode, credits, semester)"
                });
            }
        }

        const result = await courseSchema.insertMany(coursesToInsert);

        // Notify users
        const courseNames = items.map(item => item.courseName);
        createCourseNotifications(courseNames);

        return res.status(201).json({
            message: `${result.length} course(s) added successfully`,
            data: result
        });
    } catch (error: any) {
        console.error("Error in addCourse:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "One or more Course Codes already exist" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// get courses data
async function getCourses(req: any, res: any) {
    try {
        const courses = await courseSchema.find();
        return res.status(200).json(courses);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

import Resource from "../resourse/resourse.models";

async function updateCourse(req: any, res: any) {
    try {
        console.log("Update Request body:", req.body);
        const body = req.body;
        if (!body) {
            return res.status(400).json({ message: "Request body is required" })
        }
        const { courseName, courseCode, credits, semester, id } = body;
        if (!id || !courseName || !courseCode || !credits || !semester) {
            return res.status(400).json({ message: "All fields are required (courseName, courseCode, credits, semester, id)" })
        }

        // Fetch the old course details to check if the code is changing
        const oldCourse = await courseSchema.findById(id);
        if (!oldCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        const oldCode = oldCourse["Course Code"];

        // Update the course
        const course = await courseSchema.findByIdAndUpdate(id, {
            "Course Name": courseName,
            "Course Code": courseCode,
            "Credits": credits,
            "Semester": semester
        });

        // If the code has changed, update any resources that were linked to the old code
        if (oldCode !== courseCode) {
            console.log(`Cascade updating resources from ${oldCode} to ${courseCode}`);
            await Resource.updateMany(
                { course: oldCode },
                { course: courseCode }
            );
        }

        return res.status(200).json({ message: "Course updated successfully" })
    } catch (error) {
        console.error("Error in updateCourse:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function deleteCourse(req: any, res: any) {
    try {
        console.log("Delete Request body:", req.body);
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        if (!body) {
            return res.status(400).json({ message: "Request body is required" })
        }
        const { id } = body;
        if (!id) {
            return res.status(400).json({ message: "Course ID is required" })
        }
        const course = await courseSchema.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }
        return res.status(200).json({ message: "Course deleted successfully" })
    } catch (error) {
        console.error("Error in deleteCourse:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export default { addCourse, getCourses, updateCourse, deleteCourse }