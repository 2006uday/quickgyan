
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from "cors";
import routes from "./auth/auth.routes.ts";
import connectDB from "./utils/db.ts";
import cookieParser from "cookie-parser";
import aiChatRoutes from "./ai_chat/aiChat.routes.ts";

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

// Health check
app.get('/', function (req, res) {
    res.send('index');
});

// Connect to DB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});