import { Router } from "express";
import controller from "./notification.controllers";
import authMiddleware from "../auth/auth.middleware";

const router = Router();

router.get("/", authMiddleware.checkAccessTokenIsAbleToAccessMiddleware as any, (controller.getNotifications as any));
router.put("/mark-read", authMiddleware.checkAccessTokenIsAbleToAccessMiddleware as any, (controller.markAsRead as any));

export default router;
