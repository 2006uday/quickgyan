import Router from "express";
import main from "./aiChat.controllers";

const router = Router();
router.post("/", main);

export default router;
