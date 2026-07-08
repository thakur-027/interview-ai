const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
};

/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res){
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        return res.status(400).json({message: 'Username, email and password are required'});
    }
    const isUserAlreadyExists = await userModel.findOne({$or: [{username}, {email}]});
    if(isUserAlreadyExists){
        return res.status(400).json({message: 'Username or email already exists'});
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        username, 
        email,
        password: hash
    })
    
    const token = jwt.sign({id: user._id, username: user.username},
         process.env.JWT_SECRET, 
         {expiresIn: '1h'}
        );
    res.cookie('token', token, cookieOptions)
    res.status(201).json({message: 'User registered successfully', 
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    });
}

/**
 * 
 * @name loginUserController
 * @description Login a user, expects username and password in the request body
 * @access Public
 */
async function loginUserController(req, res){
    const{email, password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(400).json({message: 'Invalid email or password'});
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({message: 'Invalid email or password'});
    }
    const token = jwt.sign({id: user._id, username: user.username},
         process.env.JWT_SECRET, 
         {expiresIn: '1h'}
        );
    res.cookie('token', token, cookieOptions)
    res.status(200).json({message: 'User logged in successfully', 
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    });
}

/**
 * 
 * @name logoutUserController
 * @description Logout a user by clearing the token cookie and adding the token to the blacklist
 * @access Public 
 */
async function logoutUserController(req, res){
    const token = req.cookies.token;
    if(token){
        // Add the token to the blacklist
        await tokenBlacklistModel.create({token});
    }
    res.clearCookie('token', cookieOptions);
    res.status(200).json({message: 'User logged out successfully'});
}

/**
 * @name getMeController
 * @description Get the currently logged-in user's information
 * @access Private
 */
async function getMeController(req, res){
    const user = await userModel.findById(req.user.id)
    res.status(200).json({message: 'User fetched successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {registerUserController, 
    loginUserController, 
    logoutUserController,
    getMeController};