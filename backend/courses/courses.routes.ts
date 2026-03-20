import { Router } from "express";
import controller from "./courses.controllers";


const router = Router();

router.post("/add-course", controller.addCourse);
router.get("/get-courses", controller.getCourses);
router.put("/update-course", controller.updateCourse);
router.delete("/delete-course", controller.deleteCourse);

export default router;