import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
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

export default mongoose.model("Announcement", announcementSchema);
