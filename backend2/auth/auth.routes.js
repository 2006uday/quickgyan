import express from "express";
import authController from "./auth.controller.js";
import authMiddlewares from "./auth.middleware.js";
const { loginMiddleware, detailsMiddleware, logoutMiddleware, lastActiveMiddleware, adminMiddleware } = authMiddlewares;

const routes = express.Router();

routes.post('/signup', loginMiddleware, authController.userPost);
routes.post('/login', loginMiddleware, authController.loginPost);
routes.get('/logout', authController.logoutPost);
routes.delete('/delete-account', detailsMiddleware, lastActiveMiddleware, authController.deleteUser);
routes.get('/details', detailsMiddleware, lastActiveMiddleware, authController.getUserDetails);
routes.post('/otp', authController.otpPost);
routes.post('/otp/verify', authController.otpVerifyPost);
routes.delete('/otp', authController.allOtpDelete);
routes.get('/me', lastActiveMiddleware, authController.checkAuth);
routes.post('/verify-old-password', detailsMiddleware, lastActiveMiddleware, authController.verifyOldPassword);
routes.put('/update', detailsMiddleware, lastActiveMiddleware, authController.updateUserDetails);
routes.put('/password-change', authMiddlewares.passwordChangeMiddleware, lastActiveMiddleware, authController.passwordChange);
routes.get('/admin/users', adminMiddleware, lastActiveMiddleware, authController.getAllUsers);
routes.get('/admin/stats', adminMiddleware, lastActiveMiddleware, authController.getAdminStats);
routes.put('/admin/status-update', adminMiddleware, lastActiveMiddleware, authController.updateUserStatus);
routes.post('/admin/send-email', adminMiddleware, lastActiveMiddleware, authController.sendAccountStatusEmail);
routes.delete('/admin/delete-user', adminMiddleware, lastActiveMiddleware, authController.adminDeleteUser);
routes.put('/status-update', lastActiveMiddleware, authController.statusUpdate);


export default routes;