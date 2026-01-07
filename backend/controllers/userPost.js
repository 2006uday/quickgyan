// controllers/userPost.js
import bcrypt from "bcrypt";
import User from "../models/userSchema.js";

export default async function userPost(req, res) {
    try {
        const { username, email, dob, password } = req.body;

        if (!username || !email || !dob || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            dob,
            password: hashPassword,
        });

        const savedUser = await user.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                dob: savedUser.dob,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
