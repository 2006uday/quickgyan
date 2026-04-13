import { setServers } from "node:dns/promises";
if (process.env.NODE_ENV !== 'production') {
    setServers(["1.1.1.1", "8.8.8.8"]);
}

/**
 * Main entry point for the QuickGyan backend server.
 * This file initializes Express, connects to the database, and sets up all routes and middleware.
 */
/**
 * Import necessary modules and environment variables.
 * dotenv is used to load variables from a .env file into process.env.
 */
import dotenv from "dotenv";
dotenv.config();

/**
 * Import core dependencies for the Express application.
 * Express is the web framework, multer for file uploads, and cors for cross-origin settings.
 */
import express from 'express';
import multer from 'multer';
import cors from "cors";

/**
 * Import route handlers from different logical modules.
 * This includes authentication, AI chat, courses, and more.
 */
import routes from "./auth/auth.routes.js";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";
import aiChatRoutes from "./ai_chat/aiChat.routes.js";
import coursesRoutes from "./courses/courses.routes.js";
import resourseRoutes from "./resourse/resourse.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import announcementRoutes from "./announcements/announcement.routes.js";

/**
 * Initialize the Express application instance.
 * The server will run on the specified PORT or default to 8060.
 */
const app = express();
const PORT = process.env.PORT || 8060;

/**
 * Configure global middleware for the application.
 * This includes cookie parsing and cross-origin resource sharing (CORS).
 */
app.use(cookieParser());
app.use(
    cors({
        origin: [process.env.FRONTEND_URL || "http://localhost:3000" || "http://localhost:3001"],
        credentials: true,
    })
);

/**
 * Configure request body parsers for JSON and URL-encoded data.
 * These are required to handle POST/PUT request bodies correctly.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Register logical routes with their corresponding base paths.
 * Each module handles a specific set of features within the application.
 */
app.use('/auth', routes);
app.use('/ai-chat', aiChatRoutes);
app.use('/courses', coursesRoutes);
app.use('/resources', resourseRoutes);
app.use('/notifications', notificationRoutes);
app.use('/announcements', announcementRoutes);

/**
 * Simple health check route to verify server status.
 * Returns a basic 'index' string when the root path is accessed.
 */
app.get('/', function (req, res) {
    res.send('index');
});

/**
 * Centralized error handling middleware for the Express app.
 * This specifically handles Multer-related errors and general internal server errors.
 */
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
    next();
});

/**
 * Database connection status tracker and server starter function.
 * Ensures the database is connected before the server begins listening.
 */
let isConnected = false;
const connectToDatabase = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

/**
 * Middleware to ensure database connection is established before handling requests.
 * This is crucial for serverless environments like Vercel.
//  */
// app.use(async (req, res, next) => {
//     try {
//         await connectToDatabase();
//         next();
//     } catch (err) {
//         console.error("Database connection middleware error:", err);
//         res.status(500).json({ error: "Failed to connect to database" });
//     }
// });

/**
 * Start the server if running in a non-serverless environment.
 */
// if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch(err => {
    console.error("Initial database connection failed:", err);
});
// }

export default app;
