import express from 'express';
import {
  getAllUsers,
  getUserInfo,
  getMyProfile,
  signup,
  updateUsers,
  deleteUsers,
  login,
} from '../controllers/users-controllers';
import isLoggedIn from '../middlewares/login-required.handler';
import validatePassword from '../middlewares/validate-password.handler';
import passport from 'passport';
import upload from '../middlewares/uploadFile.handler';
import UserController from '../controllers/usersController';
import UserService from '../services/users-service';

const userService = new UserService();
const userController = new UserController(userService);

const router = express.Router();

router.get('/', userController.getAllUsers);

router.get('/myProfile', isLoggedIn, userController.getMyInfo);

router.get('/profile/:userId', getUserInfo);

router.post('/signup', userController.signUp);

router.patch(
  '/profile',
  isLoggedIn,
  upload.single('imageFile'),
  userController.updateUser,
);

router.delete('/', isLoggedIn, validatePassword, userController.deleteUser);

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  userController.signIn,
);

export default router;
