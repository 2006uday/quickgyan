import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    resourceTitle: {
        type: String,
        required: true,
        trim: true
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['book', 'notes', 'paper']
    },
    semester: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    cloudinaryResourceType: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Resources", resourceSchema);
