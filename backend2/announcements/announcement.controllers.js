import Announcement from './announcement.models.js';

import { User } from '../auth/auth.model.js';
import Notification from '../notifications/notification.models.js';

async function createBulkNotifications(announcementTitle, announcementContent) {
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

export const addAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const newAnnouncement = new Announcement({ title, content });
        await newAnnouncement.save();

        createBulkNotifications(title, content);

        return res.status(200).json({ message: "Announcement added successfully", announcement: newAnnouncement });
    } catch (error) {
        console.error("Add announcement error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        return res.status(200).json(announcements);
    } catch (error) {
        console.error("Get announcements error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Announcement.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Announcement not found" });
        }
        return res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Delete announcement error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};
