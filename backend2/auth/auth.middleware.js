/**
 * Middlewares for authentication and authorization using JSON Web Tokens (JWT).
 * Includes functions for verifying access tokens, checking user roles, and tracking activity.
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from './auth.model.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

async function checkAccessTokenIsAbleToAccessMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function loginMiddleware(req, res, next) {
    try {
        console.log("req.cookies.accessToken : ", req.cookies.accessToken);

        const token = req.cookies.accessToken;

        // If user already has a valid token, redirect them — no need to log in again
        if (token) {
            const decodedToken = jwt.verify(token, JWT_SECRET);
            req.user = decodedToken;
            console.log("User already logged in, redirecting. decodedToken:", decodedToken);
            return res.redirect("/");
        }

        // No token — let them proceed to the login handler
        next();
    } catch (error) {
        // Token was invalid/expired — clear it and let them log in fresh
        console.log("Invalid token in loginMiddleware, proceeding to login:", error.message);
        next();
    }
}

async function detailsMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("decodedToken : ", decodedToken);
        req.id = decodedToken.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logoutMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function passwordChangeMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("decodedToken : ", decodedToken);
        req.id = decodedToken.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function lastActiveMiddleware(req, res, next) {
    try {
        const userId = req.id || req.user?.id;
        if (userId) {
            const user = await User.findByIdAndUpdate(userId, { lastActive: new Date() }, { new: true });

            if (!user) {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                return res.status(401).json({ error: "Unauthorized: User account no longer exists." });
            }

            if (user.status === "suspended") {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
            }
        }
        next();
    } catch (error) {
        console.error("Error updating lastActive:", error);
        next();
    }
}
async function adminMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        req.id = decodedToken.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

export default { checkAccessTokenIsAbleToAccessMiddleware, loginMiddleware, detailsMiddleware, logoutMiddleware, passwordChangeMiddleware, lastActiveMiddleware, adminMiddleware };