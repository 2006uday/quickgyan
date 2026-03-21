import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'model', 'system'],
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

export default mongoose.model("ChatMessages", chatMessageSchema);
