/**
 * Controllers for managing academic programs.
 * Handles CRUD operations, auto-seeding, and cascade updates to courses & resources.
 */
import Program from './programs.models.js';
import courseSchema from '../courses/courses.models.js';
import Resource from '../resourse/resourse.models.js';
import { User } from '../auth/auth.model.js';
import Notification from '../notifications/notification.models.js';

async function createProgramNotifications(programNames) {
    try {
        const users = await User.find({ status: "active" }, "_id");
        if (users.length === 0) return;

        const summaryMessage = programNames.length === 1
            ? `A new academic program "${programNames[0]}" is now available on quickGyan!`
            : `${programNames.length} new academic programs have been added, including "${programNames[0]}".`;

        const notifications = users.map(user => ({
            userId: user._id,
            title: "New Program Available",
            message: summaryMessage,
            type: "info"
        }));

        await Notification.insertMany(notifications);
        console.log(`Program notifications sent to ${users.length} users`);
    } catch (error) {
        console.error("Error creating program notifications:", error);
    }
}

// Add single or multiple programs
async function addPrograms(req, res) {
    try {
        console.log("Incoming addPrograms request:", req.body);

        if (!req.body) {
            return res.status(400).json({ message: "Request body is required" });
        }

        // Support both single object and array of objects
        const items = Array.isArray(req.body) ? req.body : (req.body.programs || [req.body]);

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "At least one program is required" });
        }

        const formattedPrograms = items.map(item => ({
            code: (item.code || item.programCode || "").trim().toUpperCase(),
            name: (item.name || item.programName || "").trim(),
            description: (item.description || "").trim(),
            totalSemesters: Number(item.totalSemesters) || 6,
            category: item.category || "Undergraduate",
            status: item.status || "active"
        }));

        // Validation
        for (const prog of formattedPrograms) {
            if (!prog.code || !prog.name) {
                return res.status(400).json({
                    message: "Program code and name are required for each program."
                });
            }
            if (prog.totalSemesters < 1 || prog.totalSemesters > 12) {
                return res.status(400).json({
                    message: `Total semesters for ${prog.code} must be between 1 and 12.`
                });
            }
        }

        const result = await Program.insertMany(formattedPrograms);

        // Notify users
        const programNames = result.map(p => `${p.name} (${p.code})`);
        createProgramNotifications(programNames);

        return res.status(201).json({
            message: `${result.length} program(s) added successfully`,
            data: result
        });
    } catch (error) {
        console.error("Error in addPrograms:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "One or more Program Codes already exist (e.g. BCA, MCA)." });
        }
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
}

// Get all programs (with auto-seed fallback & attached statistics)
async function getPrograms(req, res) {
    try {
        let programs = await Program.find().sort({ createdAt: -1 });

        // Auto-seed default BCA program if database has none
        if (programs.length === 0) {
            const defaultProgram = await Program.create({
                code: "BCA",
                name: "Bachelor of Computer Applications",
                description: "3-Year Undergraduate Degree in Computer Applications",
                totalSemesters: 6,
                category: "Undergraduate",
                status: "active"
            });
            programs = [defaultProgram];
        }

        // Attach course & resource counts for each program
        const courses = await courseSchema.find({}, { Program: 1, "Course Code": 1 });
        const resources = await Resource.find({}, { program: 1, course: 1 });

        const enrichedPrograms = programs.map(p => {
            const progObj = p.toObject();
            const progCode = p.code.toUpperCase();
            
            // Count courses (if Program field is empty or matches)
            const pCourseCount = courses.filter(c => {
                const cProg = (c.Program || "BCA").toUpperCase();
                return cProg === progCode;
            }).length;

            // Count resources
            const pResourceCount = resources.filter(r => {
                const rProg = (r.program || "BCA").toUpperCase();
                return rProg === progCode;
            }).length;

            progObj.courseCount = pCourseCount;
            progObj.resourceCount = pResourceCount;
            return progObj;
        });

        return res.status(200).json(enrichedPrograms);
    } catch (error) {
        console.error("Error in getPrograms:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Update program
async function updateProgram(req, res) {
    try {
        console.log("Update Program request:", req.body);
        const { id, code, name, description, totalSemesters, category, status } = req.body;

        if (!id || !code || !name) {
            return res.status(400).json({ message: "Program ID, code, and name are required" });
        }

        const oldProgram = await Program.findById(id);
        if (!oldProgram) {
            return res.status(404).json({ message: "Program not found" });
        }

        const oldCode = oldProgram.code.toUpperCase();
        const newCode = code.trim().toUpperCase();

        const updated = await Program.findByIdAndUpdate(
            id,
            {
                code: newCode,
                name: name.trim(),
                description: description !== undefined ? description.trim() : oldProgram.description,
                totalSemesters: Number(totalSemesters) || oldProgram.totalSemesters,
                category: category || oldProgram.category,
                status: status || oldProgram.status
            },
            { new: true }
        );

        // Cascade update if program code changed
        if (oldCode !== newCode) {
            console.log(`Cascading program code update from ${oldCode} to ${newCode}`);
            await courseSchema.updateMany(
                { Program: oldCode },
                { Program: newCode }
            );
            await Resource.updateMany(
                { program: oldCode },
                { program: newCode }
            );
        }

        return res.status(200).json({
            message: "Program updated successfully",
            data: updated
        });
    } catch (error) {
        console.error("Error in updateProgram:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "A program with this code already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Delete program
async function deleteProgram(req, res) {
    try {
        console.log("Delete Program request:", req.body);
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        const id = body?.id || req.query.id;

        if (!id) {
            return res.status(400).json({ message: "Program ID is required" });
        }

        const program = await Program.findByIdAndDelete(id);
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        return res.status(200).json({ message: `Program "${program.name}" deleted successfully` });
    } catch (error) {
        console.error("Error in deleteProgram:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    addPrograms,
    getPrograms,
    updateProgram,
    deleteProgram
};
