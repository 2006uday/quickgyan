/**
 * Controllers for managing user notifications within the application.
 * This includes fetching unread notifications and marking them as read.
 */
import Notification from './notification.models.js';

async function getNotifications(req, res) {
    try {
        const userId = req.user.id
        if (!userId) { return res.status(401).json({ error: "Unauthorized" }); }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function markAsRead(req, res) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        await Notification.findByIdAndUpdate(id, { isRead: true });
        return res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        console.error("Mark as read error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default { getNotifications, markAsRead };
