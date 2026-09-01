import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Otp } from "./auth.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

async function userPost(req: any, res: any) {
    try {
        console.log("userPost - Requesting registration for email:", req.body?.email);
        const { username, enrollment_no, email, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);

        if (!username || !enrollment_no || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters long" });
        }


        const alreadyUser = await User.findOne({ email });
        if (alreadyUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const user = await User.create({
            username,
            email,
            enrollment_no,
            password: hashPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                enrollment_no: user.enrollment_no,
                lastActive: user.lastActive,
            },
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function loginPost(req: any, res: any) {
    try {
        const { email, password } = req.body;
        console.log("loginPost - Attempting login for email:", email);

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "email or password is invalid" });
        }

        if (user.status === "suspended") {
            return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const payload = {
            id: user._id,

            role: user.role,
        };

        const accessToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: "1d" });

        const refreshToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });

        const refreshTokenStore = await User.updateOne({ _id: user._id }, { $push: { refreshToken: refreshToken } });

        return res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        }).status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                enrollment_no: user.enrollment_no,
                role: user.role,
                dob: user.dob,
                lastActive: user.lastActive,
            },
        });
    } catch (error: any) {

        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function otpPost(req: any, res: any) {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);

        if (email) {
            const sameEmail = await Otp.findOne({ email });
            if (sameEmail) {
                const deleteOtp = await Otp.deleteOne({ email });
                if (deleteOtp) {
                    return res.status(400).json({ error: "OTP already sent" });
                }
            }
        }

        const otpStore = await Otp.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP for login",
            text: `Your OTP is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error: any, info: { response: string; }) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal server error" });
            }
            console.log("Email sent: " + info.response);
        });

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function otpVerifyPost(req: any, res: any) {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "email or password is invalid" });
        }
        console.log("email : ", email);

        const otpStore = await Otp.findOne({ email });
        if (!otpStore) {
            return res.status(400).json({ error: "OTP not found" });
        }

        console.log("otpStore.otp : ", otpStore.otp);
        console.log("otp : ", otp);

        if (otpStore.otp !== Number(otp)) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        console.log("OTP verified successfully");
        await Otp.deleteOne({ email });

        const payload = {
            id: user._id,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: "1d" });
        const refreshToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });

        await User.updateOne({ _id: user._id }, { $push: { refreshToken: refreshToken } });

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            enrollment_no: user.enrollment_no,
            lastActive: user.lastActive,
            role: user.role,
        };

        return res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        }).status(200).json({
            message: "OTP verified successfully",
            user: userData
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function allOtpDelete(req: any, res: any) {
    try {
        const otpStore = await Otp.deleteMany({});
        return res.status(200).json({ message: "All OTPs deleted successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logoutPost(req: any, res: any) {
    console.log("logoutPost - executing logout");
    try {
        const clearVariations: any[] = [
            { path: "/" },
            { path: "/", httpOnly: true },
            { path: "/", secure: true, sameSite: "none", httpOnly: true },
            { path: "/", secure: false, sameSite: "lax", httpOnly: true },
            { path: "/", secure: true, sameSite: "lax", httpOnly: true },
        ];

        for (const opt of clearVariations) {
            res.clearCookie("accessToken", opt);
            res.clearCookie("refreshToken", opt);
            res.cookie("accessToken", "", { ...opt, expires: new Date(0), maxAge: 0 });
            res.cookie("refreshToken", "", { ...opt, expires: new Date(0), maxAge: 0 });
        }

        let token = req.cookies?.accessToken;
        if (!token && req.headers?.cookie) {
            const match = req.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
            if (match) token = match[1];
        }

        if (token) {
            try {
                const decodedToken = jwt.verify(token, JWT_SECRET!) as any;
                if (decodedToken?.id) {
                    await User.updateOne({ _id: decodedToken.id }, { $set: { refreshToken: [] } });
                }
            } catch (_) {
                // Token may already be expired — that's fine, still log out cleanly
            }
        }

        console.log("User logged out successfully");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteUser(req: any, res: any) {
    console.log("deleteUser : ", req.params);
    try {

        const id = req.id;
        console.log(" id : ", id);
        const user = await User.findByIdAndDelete({ _id: id });
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getUserDetails(req: any, res: any) {
    try {
        const details = req.cookies.accessToken;
        const decodedToken = jwt.verify(details, JWT_SECRET!) as jwt.JwtPayload;
        return res.status(200).json({ message: "User details fetched successfully", user: decodedToken });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function checkAuth(req: any, res: any) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const data = await User.findById(decodedToken.id, { password: 0, refreshToken: 0 });
        if (!data) {
            const clearVariations: any[] = [
                { path: "/" },
                { path: "/", httpOnly: true },
                { path: "/", secure: true, sameSite: "lax", httpOnly: true },
            ];
            for (const opt of clearVariations) {
                res.clearCookie("accessToken", opt);
                res.clearCookie("refreshToken", opt);
            }
            return res.status(401).json({ error: "email or password is invalid or unauthorized" });
        }
        return res.status(200).json({ message: "User is authorized", user: data });
    } catch (error: any) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateUserDetails(req: any, res: any) {
    try {
        const id = req.id;
        if (!id) {
            return res.status(401).json({ error: "Unauthorized: User ID not found in token" });
        }

        const { username, name, email, dob, enrollment_no, enrollmentNo } = req.body;

        // Map frontend field names to backend schema fields
        const finalUsername = username || name;
        const finalEnrollmentNo = enrollment_no || enrollmentNo;

        const updateData: any = {};
        if (finalUsername) updateData.username = finalUsername;
        if (email) updateData.email = email;
        if (dob) updateData.dob = dob;
        if (finalEnrollmentNo) updateData.enrollment_no = finalEnrollmentNo;

        if (Object.keys(updateData).length > 0) {
            const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            return res.status(200).json({ message: "User details updated successfully", user });
        }
        return res.status(400).json({ error: "No update details provided" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function verifyOldPassword(req: any, res: any) {
    try {
        const id = req.id;
        const { oldPassword } = req.body;

        if (!oldPassword) {
            return res.status(400).json({ error: "Old password is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "email or password is invalid" });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid old password" });
        }

        return res.status(200).json({ message: "Old password verified", email: user.email });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function passwordChange(req: any, res: any) {
    try {
        const id = req.id;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: "New password is required" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(id, { $set: { password: hashPassword } }, { new: true });
        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getAllUsers(req: any, res: any) {
    try {
        const users = await User.find({}, { password: 0, refreshToken: 0 }); // Exclude sensitive fields
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getAdminStats(req: any, res: any) {
    try {
        const totalUsers = await User.countDocuments();
        const activeThreshold = new Date(Date.now() - 5 * 60 * 1000); // Active in last 5 minutes
        const activeUsersCount = await User.countDocuments({ lastActive: { $gte: activeThreshold } });

        return res.status(200).json({
            totalUsers,
            activeUsers: activeUsersCount
        });
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateUserStatus(req: any, res: any) {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "User ID and status are required" });
        }
        await User.findByIdAndUpdate(id, { $set: { status } });
        return res.status(200).json({ message: "User status updated successfully" });
    } catch (error) {
        console.error("Error in updateUserStatus:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function statusUpdate(req: any, res: any) {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "User ID and status are required" });
        }
        const user = await User.findByIdAndUpdate(id, { $set: { status } });

        if (!user) {
            return res.status(404).json({ error: "email or password is invalid" });
        }

        return res.status(200).json({ message: "User status updated successfully" });
    } catch (error) {
        console.error("Error in statusUpdate:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function sendAccountStatusEmail(req: any, res: any) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "email or password is invalid" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL || "ak5884771@gmail.com",
                pass: process.env.PASSWORD || "fvmf isai vkgs rpwn",
            },
        });

        const statusLabel = user.status === "suspended" ? "suspended" : "active";

        const mailOptions = {
            from: process.env.EMAIL || "ak5884771@gmail.com",
            to: user.email,
            subject: `Account Status Update - QuickGyan`,
            text: `Hello ${user.username || 'User'},\n\nYour account status is currently: ${statusLabel.toUpperCase()}.\n\nIf you have any questions, please contact the administrator.\n\nBest regards,\nQuickGyan Team`,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Status email sent successfully" });
    } catch (error) {
        console.error("Error in sendAccountStatusEmail:", error);
    }
}

async function adminDeleteUser(req: any, res: any) {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in adminDeleteUser:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default { userPost, loginPost, logoutPost, deleteUser, getUserDetails, otpPost, otpVerifyPost, allOtpDelete, checkAuth, updateUserDetails, passwordChange, verifyOldPassword, getAllUsers, getAdminStats, updateUserStatus, statusUpdate, sendAccountStatusEmail, adminDeleteUser };