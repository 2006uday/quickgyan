/**
 * This router defines HTTP end-points for course-related operations.
 * It provides functionality for adding, listing, updating, and deleting courses.
 */
import { Router } from "express";
import controller from './courses.controllers.js';


const router = Router();

router.post("/add-course", controller.addCourse);
router.get("/get-courses", controller.getCourses);
router.put("/update-course", controller.updateCourse);
router.delete("/delete-course", controller.deleteCourse);

export default router;