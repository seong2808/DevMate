"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const generate_jwt_1 = __importDefault(require("../utils/generate-jwt"));
const hash_password_1 = __importDefault(require("../utils/hash-password"));
const error_handler_1 = require("../middlewares/error.handler");
const Group_1 = __importDefault(require("../models/Group"));
class UserController {
    constructor(userService, groupService, joinService, notificationService) {
        //전체 사용자 정보 조회 (추후 삭제)
        this.getAllUsers = async (req, res, next) => {
            const users = await this.userService.getAllUsers();
            res.json({ data: { users }, error: null });
        };
        // 내 정보 조회
        this.getMyInfo = async (req, res, next) => {
            const user = req.user;
            if (!user) {
                return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요', 401));
            }
            const userId = user.userId;
            try {
                const foundUser = await this.userService.getMyInfo(userId);
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
        };
        // 다른 사람 정보 조회
        this.getUser = async (req, res, next) => {
            const userId = req.params.userId;
            try {
                const foundUser = await this.userService.getUser(userId);
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
        };
        // 로그인
        this.signIn = async (req, res, next) => {
            try {
                const email = req.body.email;
                const foundUser = await this.userService.findUserByEmail(email);
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
        };
        // 사용자 회원가입
        this.signUp = async (req, res, next) => {
            const { email, nickname, password } = req.body;
            try {
                // 이메일 중복 여부 체크
                const existingUser = await this.userService.findUserByEmail(email);
                if (existingUser) {
                    return next(new error_handler_1.HttpError('이미 존재하는 이메일입니다.', 409));
                }
            }
            catch (err) {
                return next(new error_handler_1.HttpError('서버 에러 발생', 500));
            }
            const hashedPassword = await (0, hash_password_1.default)(password);
            const createdUser = new User_1.default({ email, nickname, password: hashedPassword });
            try {
                await createdUser.save();
                res.status(201).json({
                    data: { message: '회원 가입 성공' },
                    error: null,
                });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 사용자 정보 수정
        this.updateUser = async (req, res, next) => {
            if (!req.user) {
                return next(new error_handler_1.HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401));
            }
            const userTokenInfo = req.user;
            const userId = userTokenInfo.userId;
            const foundUser = await this.userService.findUserById(userId);
            const { body } = req;
            const updates = {
                ...body,
                links: JSON.parse(body.links),
                skills: JSON.parse(body.skills),
            };
            if (updates.password) {
                return next(new error_handler_1.HttpError('요청에서 허용되지 않는 정보를 포함하고 있습니다.', 400));
            }
            updates.profileImage = req.file
                ? req.file.path
                : 'imageFile' in updates
                    ? ''
                    : foundUser?.profileImage;
            try {
                const updatedUser = await this.userService.updateUser(userId, updates);
                res.json({
                    data: { updatedUser },
                    error: null,
                });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        //사용자 정보 삭제 (회원 탈퇴)
        this.deleteUser = async (req, res, next) => {
            const userTokenInfo = req.user;
            const userId = userTokenInfo.userId;
            try {
                const foundUser = await this.userService.findUserById(userId);
                //생성 그룹 존재시 에러발생
                if (foundUser?.createdGroup) {
                    return next(new error_handler_1.HttpError('회원 탈퇴를 진행할 수 없습니다. 생성한 그룹을 삭제하고 다시 시도해주세요.', 409));
                }
                // Group 해당 User 데이터 삭제
                // currentMember에 탈퇴userId가 존재하면 제거
                await Group_1.default.updateMany({ currentMembers: userId }, { $pull: { currentMembers: userId } });
                // Join 해당 User 데이터 삭제
                await this.joinService.deleteManyByUserId(userId);
                // Notification 해당 User 데이터 삭제
                await this.notificationService.deleteAll(userId);
                // User 스키마에서 해당 User 삭제
                await this.userService.deleteUser(userId);
                res.status(204).json({ message: '삭제 완료' });
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 로그아웃
        this.logOut = async (req, res, next) => {
            try {
                res.clearCookie('token', { path: '/' });
                res.json({ message: '로그아웃 성공' });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        this.userService = userService;
        this.groupService = groupService;
        this.joinService = joinService;
        this.notificationService = notificationService;
    }
}
exports.default = UserController;
