const { ApiError } = require("../utils/ApiError.js");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findByPk(decodedToken.id || decodedToken._id);

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }
    
    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(401, err?.message || "invalid access token"));
  }
};

module.exports = { verifyJWT };
