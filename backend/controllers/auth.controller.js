import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        const image = req.file;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // HASH PASSWORD HERE
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create entry in the database
        let newUser;
        if (image) {
            newUser = new User({
                fullName,
                username,
                password: hashedPassword,
                gender, 
                image: image.buffer, 
            });
        } else {
            newUser = new User({
                fullName,
                username,
                password: hashedPassword,
                gender, 
            });
        }

        await newUser.save();

        // Generate JWT token
        generateTokenAndSetCookie(newUser._id, res);

        const imageBase64 = newUser.image ? `data:image/jpeg;base64,${newUser.image.toString('base64')}` : null;

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            image: imageBase64, // Convertir a Base64 para la respuesta
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        generateTokenAndSetCookie(user._id, res);

        const imageBase64 = user.image ? `data:image/jpeg;base64,${user.image.toString('base64')}` : null;

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            image: imageBase64, // Enviar imagen como cadena Base64
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchAllUsersController = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { username: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        const users = await User.find(keyword).find({
            _id: { $ne: req.user._id },
        });

        const usersWithImages = users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            image: user.image ? `data:image/jpeg;base64,${user.image.toString('base64')}` : null, // Convertir a Base64
        }));

        res.send(usersWithImages);
    } catch (error) {
        console.log("Error in fetchAllUsersController", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
