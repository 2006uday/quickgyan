
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import multer from 'multer';
import cors from "cors";
import routes from "./auth/auth.routes.ts";
import connectDB from "./utils/db.ts";
import cookieParser from "cookie-parser";
import aiChatRoutes from "./ai_chat/aiChat.routes.ts";
import coursesRoutes from "./courses/courses.routes.ts";
import resourseRoutes from "./resourse/resourse.routes.ts";
import notificationRoutes from "./notifications/notification.routes.ts";

const app = express();
const PORT = process.env.PORT || 8060;

// Middleware
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', routes);
app.use('/ai-chat', aiChatRoutes);
app.use('/courses', coursesRoutes);
app.use('/resources', resourseRoutes);
app.use('/notifications', notificationRoutes);
// Health check
app.get('/', function (req, res) {
    res.send('index');
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
    next();
});

// Connect to DB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});