import express from "express";
import { addAnnouncement, getAnnouncements, deleteAnnouncement } from "./announcement.controllers";

const router = express.Router();

router.post("/add", addAnnouncement);
router.get("/get", getAnnouncements);
router.delete("/delete/:id", deleteAnnouncement);

export default router;
