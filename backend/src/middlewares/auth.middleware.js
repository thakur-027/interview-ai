const jwt = require('jsonwebtoken');
const tokenblacklistModel = require('../models/blacklist.model');
async function authUser(req, res, next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message: 'Unauthorized'});
    }

    const isTokenBlacklisted = await tokenblacklistModel.findOne({token});
    if(isTokenBlacklisted){
        return res.status(401).json({
            message: 'Unauthorized'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized'});
    }
}

module.exports = {authUser};