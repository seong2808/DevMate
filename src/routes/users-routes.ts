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

const usersService = new UserService();
const userController = new UserController(usersService);

const router = express.Router();

router.get('/', getAllUsers);

router.get('/myProfile', isLoggedIn, userController.getUserInfo);

router.get('/profile/:userId', getUserInfo);

router.post('/signup', signup);

router.patch('/profile', isLoggedIn, upload.single('imageFile'), updateUsers);

router.delete('/', isLoggedIn, validatePassword, deleteUsers);

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  login,
);

export default router;
