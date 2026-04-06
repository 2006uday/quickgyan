/**
 * Router configuration for managing educational resources (files).
 * Includes endpoints for uploading, retrieving, updating, and deleting resource materials.
 */
import { Router } from "express";
import upload from './resourse.middlewares.js';
import resourses from './resourse.controllers.js';

const router = Router();

router.post("/addresource", upload.single("file"), resourses.uploadResourse);
router.get("/getresource", resourses.getResource);
router.get("/getresource/:id", resourses.getResourceById);
router.put("/updateresource", upload.single("file"), resourses.updateResource);
router.delete("/deleteresource", resourses.deleteResource);

export default router;