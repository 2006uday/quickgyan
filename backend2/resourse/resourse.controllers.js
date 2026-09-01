/**
 * Controllers for handling educational resource uploads and management.
 * Integrates with Cloudinary for file storage and provides status updates to users.
 */
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

import Resource from './resourse.models.js';
import { User } from '../auth/auth.model.js';
import Notification from '../notifications/notification.models.js';

async function createBulkNotifications(resourceTitle, resourceType, course) {
    try {
        const users = await User.find({ status: "active" }, "_id");
        if (users.length === 0) return;

        const notifications = users.map(user => ({
            userId: user._id,
            title: "New Resource Available",
            message: `A new ${resourceType} for ${course} titled "${resourceTitle}" has been uploaded.`,
            type: "info"
        }));

        await Notification.insertMany(notifications);
        console.log(`Notifications created for ${users.length} users`);
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
    }
}


// Generate signed upload parameters for direct client-to-Cloudinary uploads (bypasses serverless payload limits)
async function getUploadSignature(req, res) {
    try {
        const { folder } = req.query;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = { timestamp };
        if (folder) {
            paramsToSign.folder = folder;
        }

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        return res.status(200).json({
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            folder: paramsToSign.folder || ""
        });
    } catch (error) {
        console.error("Signature generation error:", error);
        return res.status(500).json({ error: "Failed to generate upload signature" });
    }
}

// admin can upload their resource (supports direct Cloudinary upload via JSON and legacy req.file)
async function uploadResourse(req, res) {
    try {
        const { resourceTitle, resourceType, semester, course, program, fileUrl, publicId, cloudinaryResourceType } = req.body;
        const progCode = (program || "BCA").trim().toUpperCase();

        console.log("Incoming Resource Upload:", { resourceTitle, resourceType, semester, course, program: progCode, directUpload: !!fileUrl });

        // Direct upload: frontend already uploaded to Cloudinary
        if (fileUrl && publicId) {
            const newResource = new Resource({
                resourceTitle,
                resourceType: resourceType || "book",
                semester: semester || 'unclassified',
                course,
                program: progCode,
                fileUrl,
                publicId,
                cloudinaryResourceType: cloudinaryResourceType || "raw"
            });

            await newResource.save();
            createBulkNotifications(resourceTitle, resourceType || "book", course);

            return res.status(200).json({
                message: "Resource uploaded and saved successfully",
                resource: newResource
            });
        }

        // Fallback: multipart file buffer uploaded directly to backend
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded or file metadata missing" });
        }

        const folderName = `${progCode.toLowerCase()}/semester_${semester || 'unclassified'}`;

        // Convert the file buffer to a base64 string for Cloudinary
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = "data:" + file.mimetype + ";base64," + b64;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folderName,
            resource_type: "auto",
        });

        // Save to Database
        const newResource = new Resource({
            resourceTitle,
            resourceType: resourceType || "book",
            semester: semester || 'unclassified',
            course,
            program: progCode,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            cloudinaryResourceType: result.resource_type
        });

        await newResource.save();

        // Create notifications for all users in the background
        createBulkNotifications(resourceTitle, resourceType || "book", course);

        return res.status(200).json({
            message: "Resource uploaded and saved successfully",
            result,
            resource: newResource
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(error.http_code || 500).json({
            error: error.message || "Internal server error",
            details: error
        });
    }
}
async function getResource(req, res) {
    try {
        const { search, semester, type, courseCode, program } = req.query;
        let query = {};

        if (program) query.program = program.trim().toUpperCase();
        if (semester) query.semester = semester;
        if (type) query.resourceType = type;
        if (courseCode) query.course = courseCode;
        if (search) {
            query.$or = [
                { resourceTitle: { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } }
            ];
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ resources });
    }
    catch (error) {
        console.error("Get resources error:", error);
        return res.status(error.http_code || 500).json({
            error: error.message || "Internal server error"
        });
    }
}
async function getResourceById(req, res) {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }
        return res.status(200).json({ resource });
    }
    catch (error) {
        console.error("Get resource by ID error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateResource(req, res) {
    try {
        const { id, resourceTitle, resourceType, semester, course, program, fileUrl, publicId, cloudinaryResourceType } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Resource ID is required" });
        }

        const existingResource = await Resource.findById(id);
        if (!existingResource) { return res.status(404).json({ error: "Resource not found" }); }

        let updateData = {
            resourceTitle,
            resourceType,
            semester,
            course
        };
        if (program) {
            updateData.program = program.trim().toUpperCase();
        }

        // Direct file update: frontend already uploaded replacement to Cloudinary
        if (fileUrl && publicId) {
            // Remove old file from Cloudinary
            if (existingResource.publicId && existingResource.publicId !== publicId) {
                try {
                    await cloudinary.uploader.destroy(existingResource.publicId, {
                        resource_type: existingResource.cloudinaryResourceType || "auto"
                    });
                } catch (cErr) {
                    console.error("Error removing old Cloudinary resource:", cErr);
                }
            }

            updateData.fileUrl = fileUrl;
            updateData.publicId = publicId;
            updateData.cloudinaryResourceType = cloudinaryResourceType || "raw";
        }
        // Fallback: Check if a new file buffer is provided
        else if (req.file) {
            // Remove old file from Cloudinary using stored resource type
            if (existingResource.publicId) {
                await cloudinary.uploader.destroy(existingResource.publicId, {
                    resource_type: "auto"
                });
            }

            // Upload new file
            const folderName = `bca/semester_${semester || existingResource.semester}`;
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: folderName,
                resource_type: "auto",
            });

            updateData.fileUrl = result.secure_url;
            updateData.publicId = result.public_id;
            updateData.cloudinaryResourceType = result.resource_type;
        }

        const updatedResource = await Resource.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

        return res.status(200).json({
            message: "Resource updated successfully",
            resource: updatedResource
        });
    } catch (error) {
        console.error("Update resource error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteResource(req, res) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Resource ID is required" });
        }

        const resource = await Resource.findById(id);
        if (!resource) { return res.status(404).json({ error: "Resource not found" }); }

        // Delete from Cloudinary using the correct resource type
        if (resource.publicId) {
            await cloudinary.uploader.destroy(resource.publicId, {
                resource_type: (resource).cloudinaryResourceType || "image"
            });
        }

        // Delete from DB
        await Resource.findByIdAndDelete(id);

        return res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        console.error("Delete resource error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function bulkUploadResources(req, res) {
    try {
        // Direct Cloudinary bulk upload: client uploaded to Cloudinary and sends array of resource objects
        if (req.body.resources && Array.isArray(req.body.resources)) {
            const savedResources = [];
            const failedItems = [];

            for (const item of req.body.resources) {
                try {
                    const progCode = (item.program || "BCA").trim().toUpperCase();
                    const newResource = new Resource({
                        resourceTitle: item.resourceTitle || item.title || "Untitled Resource",
                        resourceType: item.resourceType || item.type || "book",
                        semester: item.semester || "1",
                        course: item.course || "GENERAL",
                        program: progCode,
                        fileUrl: item.fileUrl,
                        publicId: item.publicId,
                        cloudinaryResourceType: item.cloudinaryResourceType || "raw"
                    });

                    await newResource.save();
                    savedResources.push(newResource);
                } catch (err) {
                    console.error("Failed to save resource item:", err);
                    failedItems.push({ item, error: err.message });
                }
            }

            if (savedResources.length > 0) {
                const firstProg = savedResources[0].program || "BCA";
                createBulkNotifications(`${savedResources.length} new materials`, "materials", firstProg);
            }

            return res.status(200).json({
                message: `${savedResources.length} of ${req.body.resources.length} resource(s) uploaded successfully`,
                count: savedResources.length,
                resources: savedResources,
                failed: failedItems
            });
        }

        // Fallback: multipart files uploaded directly to backend
        const files = req.files || [];
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded for bulk processing" });
        }

        let itemsMetadata = [];
        if (req.body.items) {
            try {
                itemsMetadata = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;
            } catch (e) {
                console.error("Error parsing items metadata:", e);
            }
        }

        const savedResources = [];
        const failedItems = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const meta = itemsMetadata[i] || {};

            const resourceTitle = meta.resourceTitle || meta.title || file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            const resourceType = meta.resourceType || meta.type || "book";
            const semester = meta.semester || "1";
            const course = meta.course || "GENERAL";
            const progCode = (meta.program || req.body.program || "BCA").trim().toUpperCase();

            try {
                const folderName = `${progCode.toLowerCase()}/semester_${semester || 'unclassified'}`;
                const b64 = Buffer.from(file.buffer).toString("base64");
                const dataURI = "data:" + file.mimetype + ";base64," + b64;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: folderName,
                    resource_type: "auto",
                });

                const newResource = new Resource({
                    resourceTitle,
                    resourceType,
                    semester,
                    course,
                    program: progCode,
                    fileUrl: result.secure_url,
                    publicId: result.public_id,
                    cloudinaryResourceType: result.resource_type
                });

                await newResource.save();
                savedResources.push(newResource);
            } catch (err) {
                console.error(`Failed to upload file ${file.originalname}:`, err);
                failedItems.push({ filename: file.originalname, error: err.message });
            }
        }

        if (savedResources.length > 0) {
            const firstProg = savedResources[0].program || "BCA";
            createBulkNotifications(`${savedResources.length} new materials`, "materials", firstProg);
        }

        return res.status(200).json({
            message: `${savedResources.length} of ${files.length} resource(s) uploaded successfully`,
            count: savedResources.length,
            resources: savedResources,
            failed: failedItems
        });
    } catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({ error: error.message || "Internal server error during bulk upload" });
    }
}

export default { getUploadSignature, uploadResourse, bulkUploadResources, getResource, getResourceById, updateResource, deleteResource }