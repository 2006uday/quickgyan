/**
 * Utility file for connecting to the MongoDB database using Mongoose.
 * This file contains logic for handling database connection retries and configurations.
 */
import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not defined in .env");
        process.exit(1);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
            });
            console.log("Connected to MongoDB...");
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
            if (attempt < retries) {
                const delay = attempt * 3000;
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    console.error("All MongoDB connection attempts failed. Exiting.");
    process.exit(1);
}

export default connectDB;