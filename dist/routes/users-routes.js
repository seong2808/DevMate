"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_required_handler_1 = __importDefault(require("../middlewares/login-required.handler"));
const validate_password_handler_1 = __importDefault(require("../middlewares/validate-password.handler"));
const passport_1 = __importDefault(require("passport"));
const uploadFile_handler_1 = __importDefault(require("../middlewares/uploadFile.handler"));
const users_controller_1 = __importDefault(require("../controllers/users-controller"));
const users_service_1 = __importDefault(require("../services/users-service"));
const groups_service_1 = __importDefault(require("../services/groups-service"));
const join_service_1 = __importDefault(require("../services/join-service"));
const notification_service_1 = __importDefault(require("../services/notification-service"));
const userService = new users_service_1.default();
const groupService = new groups_service_1.default();
const joinService = new join_service_1.default();
const notificationService = new notification_service_1.default();
const userController = new users_controller_1.default(userService, groupService, joinService, notificationService);
const router = express_1.default.Router();
router.get('/', userController.getAllUsers);
router.get('/myProfile', login_required_handler_1.default, userController.getMyInfo);
router.get('/profile/:userId', userController.getUser);
router.post('/signup', userController.signUp);
router.post('/logout', userController.logOut);
router.patch('/profile', login_required_handler_1.default, uploadFile_handler_1.default.single('imageFile'), userController.updateUser);
router.delete('/', login_required_handler_1.default, validate_password_handler_1.default, userController.deleteUser);
router.post('/login', passport_1.default.authenticate('local', { session: false }), userController.signIn);
exports.default = router;
