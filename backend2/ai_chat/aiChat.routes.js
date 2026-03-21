import Router from "express";
import controller from './aiChat.controllers.js';
import authMiddleware from '../auth/auth.middleware.js';

const router = Router();
const { checkAccessTokenIsAbleToAccessMiddleware } = authMiddleware;

router.post("/", checkAccessTokenIsAbleToAccessMiddleware, controller.askAI);
router.get("/history", checkAccessTokenIsAbleToAccessMiddleware, controller.getHistory);
router.delete("/clear", checkAccessTokenIsAbleToAccessMiddleware, controller.clearHistory);

export default router;
