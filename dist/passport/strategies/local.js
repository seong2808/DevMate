"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../../models/User"));
const error_handler_1 = require("../../middlewares/error.handler");
const passportConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
const local = new passport_local_1.Strategy(passportConfig, async (email, password, done) => {
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            // return done(null, false, { message: '회원을 찾을 수 없습니다.' });
            return done(new error_handler_1.HttpError('회원을 찾을 수 없습니다.', 404));
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            // return done(null, false, { message: '비밀번호를 확인해주세요.' });
            return done(new error_handler_1.HttpError('비밀번호를 확인해주세요.', 401));
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
});
exports.default = local;
