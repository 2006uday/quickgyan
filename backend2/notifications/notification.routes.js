import { Router } from "express";
import controller from './notification.controllers.js';
import authMiddleware from '../auth/auth.middleware.js';

const router = Router();

router.get("/", authMiddleware.checkAccessTokenIsAbleToAccessMiddleware, (controller.getNotifications));
router.put("/mark-read", authMiddleware.checkAccessTokenIsAbleToAccessMiddleware, (controller.markAsRead));

export default router;
