import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Otp } from "./auth.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

async function userPost(req: Request, res: Response) {
    console.log("userPost : ", req.body);

    try {
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
            },
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function loginPost(req: Request, res: Response) {
    console.log("loginPost : ", req.body);
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
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
                dob: user.dob,
            },
        });
    } catch (error: any) {

        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function otpPost(req: Request, res: Response) {
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
                user: process.env.EMAIL || "ak5884771@gmail.com",
                pass: process.env.PASSWORD || "fvmf isai vkgs rpwn",
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

async function otpVerifyPost(req: Request, res: Response) {
    try {
        const { email, otp } = req.body;

        const user = await User.find({ email });
        console.log(user);

        if (!user) {
            return res.status(400).json({ error: "User not found" });
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

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function allOtpDelete(req: Request, res: Response) {
    try {
        const otpStore = await Otp.deleteMany({});
        return res.status(200).json({ message: "All OTPs deleted successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logoutPost(req: Request, res: Response) {
    console.log("logoutPost");
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        console.log("accessToken : ", req.cookies.accessToken);
        console.log("refreshToken : ", req.cookies.refreshToken);

        console.log("User logged out successfully");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getUserDetails(req: Request, res: Response) {
    try {
        const details = req.cookies.accessToken;
        const decodedToken = jwt.verify(details, JWT_SECRET!) as jwt.JwtPayload;
        return res.status(200).json({ message: "User details fetched successfully", user: decodedToken });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function checkAuth(req: Request, res: Response) {
    try {
        const token = req.cookies.accessToken;
        const decodedToken = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
        // console.log("decodedToken : ", decodedToken);
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const data = await User.findById({ _id: decodedToken.id });
        return res.status(200).json({ message: "User is authorized", user: data });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateUserDetails(req: Request, res: Response) {
    try {
        const id = req.body.id;
        const username = req.body?.username;
        const email = req.body?.email;
        const dob = req.body?.dob;
        const enrollment_no = req.body?.enrollment_no;
        const user = await User.findByIdAndUpdate(id, { username, email, dob, enrollment_no });
        return res.status(200).json({ message: "User details updated successfully" });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default { userPost, loginPost, logoutPost, deleteUser, getUserDetails, otpPost, otpVerifyPost, allOtpDelete, checkAuth, updateUserDetails };