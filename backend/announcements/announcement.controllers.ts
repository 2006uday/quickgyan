import Announcement from "./announcement.models";
import { Request, Response } from "express";
import { User } from "../auth/auth.model";
import Notification from "../notifications/notification.models";

async function createBulkNotifications(announcementTitle: string, announcementContent: string) {
    try {
        const users = await User.find({ status: "active" }, "_id");
        if (users.length === 0) return;

        const notifications = users.map(user => ({
            userId: user._id,
            title: `Announcement: ${announcementTitle}`,
            message: announcementContent,
            type: "info"
        }));

        await Notification.insertMany(notifications);
        console.log(`Notifications created for ${users.length} users`);
    } catch (error) {
        console.error("Error creating bulk notifications:", error);
    }
}

export const addAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const newAnnouncement = new Announcement({ title, content });
        await newAnnouncement.save();

        createBulkNotifications(title, content);

        return res.status(200).json({ message: "Announcement added successfully", announcement: newAnnouncement });
    } catch (error: any) {
        console.error("Add announcement error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        return res.status(200).json(announcements);
    } catch (error: any) {
        console.error("Get announcements error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Announcement.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Announcement not found" });
        }
        return res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        console.error("Delete announcement error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};
