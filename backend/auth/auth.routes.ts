import express from "express";
import authController from "./auth.controller.js";
import authMiddlewares from "./auth.middleware.js";
const { loginMiddleware, detailsMiddleware, logoutMiddleware } = authMiddlewares;

const routes = express.Router();

routes.post('/signup', loginMiddleware, authController.userPost);
routes.post('/login', loginMiddleware, authController.loginPost);
routes.get('/logout',logoutMiddleware, authController.logoutPost);
routes.delete('/', loginMiddleware, authController.deleteUser);
routes.get('/details', detailsMiddleware, authController.getUserDetails);
routes.post('/otp', authController.otpPost);
routes.post('/otp/verify', authController.otpVerifyPost);
routes.delete('/otp', authController.allOtpDelete);
routes.get('/me', authController.checkAuth);
routes.put('/update', detailsMiddleware, authController.updateUserDetails);

export default routes;