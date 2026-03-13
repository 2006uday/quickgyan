import express from "express";
import authController from "./auth.controller.js";
import authMiddlewares from "./auth.middleware.js";
const { loginMiddleware, detailsMiddleware, logoutMiddleware } = authMiddlewares;

const routes = express.Router();

routes.post('/signup', loginMiddleware, authController.userPost);
routes.post('/login', loginMiddleware, authController.loginPost);
routes.get('/logout', logoutMiddleware, authController.logoutPost);
routes.delete('/delete-account', detailsMiddleware, authController.deleteUser);
routes.get('/details', detailsMiddleware, authController.getUserDetails);
routes.post('/otp', authController.otpPost);
routes.post('/otp/verify', authController.otpVerifyPost);
routes.delete('/otp', authController.allOtpDelete);
routes.get('/me', authController.checkAuth);
routes.post('/verify-old-password', detailsMiddleware, authController.verifyOldPassword);
routes.put('/update', detailsMiddleware, authController.updateUserDetails);
routes.put('/password-change', authMiddlewares.passwordChangeMiddleware, authController.passwordChange);

export default routes;