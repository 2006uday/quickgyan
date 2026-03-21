import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://quickGyan:quickGyan2006@cluster0.rs6qx7q.mongodb.net/newquickGyan?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Connected to MongoDB...");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        // Retry after 5 seconds instead of killing the server immediately
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;