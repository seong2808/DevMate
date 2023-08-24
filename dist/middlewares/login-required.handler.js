"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("./error.handler");
const isLoggedIn = (req, res, next) => {
    if (!req.user) {
        return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401));
    }
    next();
};
exports.default = isLoggedIn;
