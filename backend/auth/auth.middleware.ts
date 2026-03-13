import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

async function checkAccessTokenIsAbleToAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET!);
        req.user = decodedToken;
        next();
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function loginMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("req.cookies.accessToken : ", req.cookies.accessToken);

        const token = req.cookies.accessToken;

        // If user already has a valid token, redirect them — no need to log in again
        if (token) {
            const decodedToken = jwt.verify(token, JWT_SECRET!);
            req.user = decodedToken;
            console.log("User already logged in, redirecting. decodedToken:", decodedToken);
            return res.redirect("/home");
        }

        // No token — let them proceed to the login handler
        next();
    } catch (error: any) {
        // Token was invalid/expired — clear it and let them log in fresh
        console.log("Invalid token in loginMiddleware, proceeding to login:", error.message);
        next();
    }
}

async function detailsMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET!) as any;
        console.log("decodedToken : ", decodedToken);
        req.id = decodedToken.id;
        next();
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logoutMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET!);
        req.user = decodedToken;
        next();
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function passwordChangeMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET!) as any;
        console.log("decodedToken : ", decodedToken);
        req.id = decodedToken.id;
        next();
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default { checkAccessTokenIsAbleToAccessMiddleware, loginMiddleware, detailsMiddleware, logoutMiddleware, passwordChangeMiddleware };