"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const getToken = (req, res, next) => {
    if (!req.cookies.token) {
        next();
        return;
    }
    passport_1.default.authenticate('jwt', { session: false })(req, res, next);
};
exports.default = getToken;
