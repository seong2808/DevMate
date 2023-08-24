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
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../../models/User"));
const error_handler_1 = require("../../middlewares/error.handler");
const passportConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
const local = new passport_local_1.Strategy(passportConfig, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            // return done(null, false, { message: '회원을 찾을 수 없습니다.' });
            return done(new error_handler_1.HttpError('회원을 찾을 수 없습니다.', 404));
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            // return done(null, false, { message: '비밀번호를 확인해주세요.' });
            return done(new error_handler_1.HttpError('비밀번호를 확인해주세요.', 401));
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
exports.default = local;
