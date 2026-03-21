import Router from "express";
import controller from "./aiChat.controllers";
import authMiddleware from "../auth/auth.middleware";

const router = Router();
const { checkAccessTokenIsAbleToAccessMiddleware } = authMiddleware;

router.post("/", checkAccessTokenIsAbleToAccessMiddleware as any, controller.askAI);
router.get("/history", checkAccessTokenIsAbleToAccessMiddleware as any, controller.getHistory);
router.delete("/clear", checkAccessTokenIsAbleToAccessMiddleware as any, controller.clearHistory);

export default router;
