"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_handler_1 = require("./error.handler");
const validatePassword = async (req, res, next) => {
    const { userId } = req.user;
    const foundUser = await User_1.default.findById(userId);
    const { password } = req.body;
    if (!foundUser) {
        return; //에러 처리 필요
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, foundUser.password); //유저 입력 패스워드와 DB 패스워드 비교
    if (!isPasswordValid) {
        return next(new error_handler_1.HttpError('비밀번호가 일치하지 않습니다.', 401));
    }
    next();
};
exports.default = validatePassword;
