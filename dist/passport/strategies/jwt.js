"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const passport_jwt_1 = require("passport-jwt");
const cookieExtractor = (req) => {
    const { token } = req.cookies;
    return token;
};
const jwtConfig = {
    jwtFromRequest: cookieExtractor,
    // ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};
const jwt = new passport_jwt_1.Strategy(jwtConfig, (jwtPayload, done) => {
    return done(null, jwtPayload);
});
exports.default = jwt;
