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

export function extractToken(req) {
    if (req.cookies?.accessToken) return req.cookies.accessToken;
    if (req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }
    if (req.headers?.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
        if (match) return match[1];
    }
    return null;
}

async function checkAccessTokenIsAbleToAccessMiddleware(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) {
            console.log("checkAccessTokenIsAbleToAccessMiddleware - No token found in cookies or Authorization header.");
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("checkAccessTokenIsAbleToAccessMiddleware - Token verified successfully for user ID:", decodedToken.id);
        req.user = decodedToken;
        req.id = decodedToken.id;
        next();
    } catch (error) {
        console.log("checkAccessTokenIsAbleToAccessMiddleware - Verification failed:", error.message);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function loginMiddleware(req, res, next) {
    try {
        const token = extractToken(req);
        console.log("loginMiddleware - token present : ", !!token);
        next();
    } catch (error) {
        next();
    }
}

async function detailsMiddleware(req, res, next) {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("decodedToken user ID : ", decodedToken.id);
        req.id = decodedToken.id;
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logoutMiddleware(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        req.id = decodedToken.id;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function passwordChangeMiddleware(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        console.log("decodedToken user ID : ", decodedToken.id);
        req.id = decodedToken.id;
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function lastActiveMiddleware(req, res, next) {
    try {
        let userId = req.id || req.user?.id;
        if (!userId) {
            const token = extractToken(req);
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.id;
                } catch (_) {}
            }
        }
        if (userId) {
            const user = await User.findByIdAndUpdate(userId, { lastActive: new Date() }, { returnDocument: 'after' });

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
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        req.id = decodedToken.id;
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

export default { extractToken, checkAccessTokenIsAbleToAccessMiddleware, loginMiddleware, detailsMiddleware, logoutMiddleware, passwordChangeMiddleware, lastActiveMiddleware, adminMiddleware };