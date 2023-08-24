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
exports.deleteUsers = exports.updateUsers = exports.signup = exports.getUserInfo = exports.getMyProfile = exports.login = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const generate_jwt_1 = __importDefault(require("../utils/generate-jwt"));
const hash_password_1 = __importDefault(require("../utils/hash-password"));
const error_handler_1 = require("../middlewares/error.handler");
//전체 사용자 정보 조회 (추후 삭제 예정)
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find();
    res.json({ data: { users }, error: null });
});
exports.getAllUsers = getAllUsers;
// 사용자 로그인 API
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const foundUser = yield User_1.default.findOne({ email });
        if (!foundUser) {
            return next(new error_handler_1.HttpError('사용자를 찾을 수 없습니다.', 404));
        }
        const userId = foundUser._id;
        const user = { userId: userId, email: email };
        (0, generate_jwt_1.default)(res, user);
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.login = login;
//내 정보 조회 API
const getMyProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401));
    }
    const userTokenInfo = req.user;
    const userId = userTokenInfo.userId;
    try {
        const foundUser = yield User_1.default.findById(userId, '-password'); //password 제외
        if (!foundUser) {
            return next(new error_handler_1.HttpError('사용자를 찾을 수 없습니다.', 404));
        }
        res.json({
            data: { foundUser },
            error: null,
        });
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.getMyProfile = getMyProfile;
//다른 유저 정보 조회 API
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const foundUser = yield User_1.default.findById(userId, '-password');
        if (!foundUser) {
            return next(new error_handler_1.HttpError('사용자를 찾을 수 없습니다.', 404));
        }
        res.json({
            data: { foundUser },
            error: null,
        });
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.getUserInfo = getUserInfo;
//사용자 회원가입 API
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, nickname, password } = req.body;
    // 이미 존재하는 이메일 체크
    // 이메일 형식 validation 필요
    let existingUser;
    try {
        existingUser = yield User_1.default.findOne({ email: email });
    }
    catch (err) {
        return next(new error_handler_1.HttpError('서버 에러 발생', 500));
    }
    if (existingUser) {
        return next(new error_handler_1.HttpError('이미 존재하는 이메일입니다.', 409));
    }
    const hashedPassword = yield (0, hash_password_1.default)(password);
    const createdUser = new User_1.default({ email, nickname, password: hashedPassword });
    try {
        yield createdUser.save();
        res.status(201).json({
            data: { message: '회원 가입 성공' },
            error: null,
        });
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.signup = signup;
//사용자 정보 수정 API (완료)
const updateUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401));
    }
    const userTokenInfo = req.user;
    const userId = userTokenInfo.userId;
    const updates = req.body;
    // 비밀번호 변경시 에러처리
    if (updates.password) {
        // updates.password = await hashPassword(updates.password);
        return next(new error_handler_1.HttpError('요청에서 허용되지 않는 정보를 포함하고 있습니다.', 400));
    }
    updates.profileImage = req.file ? req.file.path : ''; // 이미지 파일 처리
    try {
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, updates, {
            new: true,
            select: '-password',
        });
        res.json({
            data: { updatedUser },
            error: null,
        });
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.updateUsers = updateUsers;
//사용자 정보 삭제(탈퇴) API (완료)
const deleteUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401));
    }
    const userTokenInfo = req.user;
    const userId = userTokenInfo.userId;
    try {
        const userToDelete = yield User_1.default.findByIdAndDelete(userId);
        res.status(204).json({ message: '삭제 완료' }); // redirect 여부 의논 필요
    }
    catch (err) {
        const error = new error_handler_1.HttpError('서버 에러 발생', 500);
        return next(error);
    }
});
exports.deleteUsers = deleteUsers;
