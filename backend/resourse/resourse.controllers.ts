import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import Resource from "./resourse.models";
import { User } from "../auth/auth.model";
import Notification from "../notifications/notification.models";

async function createBulkNotifications(resourceTitle: string, resourceType: string, course: string) {
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

async function uploadResourse(req: any, res: Response) { // Using 'any' for 'req' to avoid 'file is possibly undefined' error
    try {
        const { resourceTitle, resourceType, semester, course } = req.body;

        console.log("Incoming Resource Upload:", { resourceTitle, resourceType, semester, course });
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const folderName = `bca/semester_${semester || 'unclassified'}`;

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
            resourceType,
            semester: semester || 'unclassified',
            course,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            cloudinaryResourceType: result.resource_type
        });

        await newResource.save();

        // Create notifications for all users in the background
        createBulkNotifications(resourceTitle, resourceType, course);

        return res.status(200).json({
            message: "Resource uploaded and saved successfully",
            result: result,
            resource: newResource
        });
    }
    catch (error: any) {
        console.error("Upload error:", error);
        return res.status(error.http_code || 500).json({
            error: error.message || "Internal server error",
            details: error
        });
    }
}
async function getResource(req: Request, res: Response) {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        return res.status(200).json({ resources });
    }
    catch (error: any) {
        console.error("Get resources error:", error);
        return res.status(error.http_code || 500).json({
            error: error.message || "Internal server error"
        });
    }
}
async function updateResource(req: any, res: Response) {
    try {
        const { id, resourceTitle, resourceType, semester, course } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Resource ID is required" });
        }

        const existingResource = await Resource.findById(id);
        if (!existingResource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        let updateData: any = {
            resourceTitle,
            resourceType,
            semester,
            course
        };

        // Check if a new file is provided
        if (req.file) {
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

        const updatedResource = await Resource.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            message: "Resource updated successfully",
            resource: updatedResource
        });
    } catch (error: any) {
        console.error("Update resource error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteResource(req: Request, res: Response) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Resource ID is required" });
        }

        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        // Delete from Cloudinary using the correct resource type
        if (resource.publicId) {
            await cloudinary.uploader.destroy(resource.publicId, {
                resource_type: (resource as any).cloudinaryResourceType || "image"
            });
        }

        // Delete from DB
        await Resource.findByIdAndDelete(id);

        return res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error: any) {
        console.error("Delete resource error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default { uploadResourse, getResource, updateResource, deleteResource }