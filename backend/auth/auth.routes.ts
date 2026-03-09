import express from "express";
import authController from "./auth.controller.js";
import authMiddlewares from "./auth.middleware.js";
const { loginMiddleware, detailsMiddleware } = authMiddlewares;

const routes = express.Router();

routes.post('/signup', loginMiddleware, authController.userPost);
routes.post('/login', loginMiddleware, authController.loginPost);
routes.get('/logout', loginMiddleware, authController.logoutPost);
routes.delete('/', loginMiddleware, authController.deleteUser);
routes.get('/details', detailsMiddleware, authController.getUserDetails);
routes.post('/otp', authController.otpPost);
routes.post('/otp/verify', authController.otpVerifyPost);
routes.delete('/otp', authController.allOtpDelete);
routes.get('/me', authController.checkAuth);

export default routes;