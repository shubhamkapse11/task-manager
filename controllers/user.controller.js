const { User } = require("../models");  
const { ApiError } = require("../utils/ApiError");


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cookie = req.cookies.accessToken;
        if (!name || !email || !password) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }
        const user = await User.create({ name, email, password });
        const token = user.generateToken();
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        const withoutPassword = user.toJSON();
        delete withoutPassword.password;
        res.status(201).json({ user: withoutPassword, token });
    } catch (error) {
        res.status(500).json({
            "status": 500,
            "message": error.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json(new ApiError(401, "Invalid email or password"));
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json( new ApiError(401, "Invalid email or password"));
        }
        const withoutPassword = user.toJSON();
        delete withoutPassword.password;
        const token = user.generateToken();
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ user: withoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { registerUser , loginUser };
