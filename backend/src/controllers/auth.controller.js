const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res){
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (username.trim().length < 2) {
            return res.status(400).json({ message: 'Username must be at least 2 characters' });
        }

        const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hash });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
}

/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res){
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            message: 'User logged in successfully',
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Failed to log in' });
    }
}

/**
 * @name logoutUserController
 * @description Logout a user by clearing the token cookie and blacklisting the token
 * @access Public
 */
async function logoutUserController(req, res){
    try {
        const token = req.cookies.token;
        if (token) {
            await tokenBlacklistModel.create({ token });
        }
        res.clearCookie('token', cookieOptions);
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Failed to log out' });
    }
}

/**
 * @name getMeController
 * @description Get the currently logged-in user's information
 * @access Private
 */
async function getMeController(req, res){
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };
