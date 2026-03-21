import mongoose from "mongoose";

interface IAnnouncement {
    title: string;
    content: string;
    date: Date;
}

const announcementSchema = new mongoose.Schema<IAnnouncement>({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete after 1 month
    }
});

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);
