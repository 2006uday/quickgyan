/**
 * Express router for Programs endpoints.
 */
import express from 'express';
import programsControllers from './programs.controllers.js';

const router = express.Router();

router.get('/get-programs', programsControllers.getPrograms);
router.get('/', programsControllers.getPrograms);
router.post('/add-program', programsControllers.addPrograms);
router.put('/update-program', programsControllers.updateProgram);
router.delete('/delete-program', programsControllers.deleteProgram);

export default router;
