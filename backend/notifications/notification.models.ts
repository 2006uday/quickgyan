import mongoose from "mongoose";

interface INotification {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d' // Automatically delete after 1 week
    }
});

export default mongoose.model<INotification>("Notifications", notificationSchema);
