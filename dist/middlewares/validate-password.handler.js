"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_handler_1 = require("./error.handler");
const validatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const foundUser = yield User_1.default.findById(userId);
    const { password } = req.body;
    if (!foundUser) {
        return; //에러 처리 필요
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, foundUser.password); //유저 입력 패스워드와 DB 패스워드 비교
    if (!isPasswordValid) {
        return next(new error_handler_1.HttpError('비밀번호가 일치하지 않습니다.', 401));
    }
    next();
});
exports.default = validatePassword;
