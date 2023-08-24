"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (res, user) => {
    const payload = user;
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret');
    res.cookie('token', token).json({ message: '로그인 완료', error: null });
};
exports.default = generateJWT;
