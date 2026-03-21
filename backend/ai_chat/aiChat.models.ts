import mongoose from "mongoose";

interface IChatMessage {
    userId: mongoose.Types.ObjectId;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

const chatMessageSchema = new mongoose.Schema<IChatMessage>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Optional: auto-expire chat history after 30 days to keep DB clean
    }
});

export default mongoose.model<IChatMessage>("ChatMessages", chatMessageSchema);
