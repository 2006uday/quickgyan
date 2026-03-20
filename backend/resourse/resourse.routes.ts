import { Router } from "express";
import upload from "./resourse.middlewares";
import resourses from "./resourse.controllers";

const router = Router();

router.post("/addresource", upload.single("file"), resourses.uploadResourse);
router.get("/getresource", resourses.getResource);
router.put("/updateresource", upload.single("file"), resourses.updateResource);
router.delete("/deleteresource", resourses.deleteResource);

export default router;