import mongoose from "mongoose";

interface IResource {
    resourceTitle: string;
    resourceType: string;
    semester: string;
    course: string;
    fileUrl: string;
    publicId: string;
    cloudinaryResourceType: string; // To track if it's image/raw etc.
    createdAt: Date;
}

const resourceSchema = new mongoose.Schema<IResource>({
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

export default mongoose.model<IResource>("Resources", resourceSchema);
