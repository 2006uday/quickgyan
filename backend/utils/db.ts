import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/newquickGyan", {
            serverSelectionTimeoutMS: 10000, // Wait 10s before timing out
            socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
            family: 4,                       // Force IPv4, avoids IPv6 DNS issues
        });
        console.log("Connected to MongoDB...");
    } catch (err: any) {
        console.error("MongoDB connection error:", err.message);
        // Retry after 5 seconds instead of killing the server immediately
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;