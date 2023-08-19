import express from 'express';
import {
  getAllUsers,
  getUsers,
  signup,
  updateUsers,
  deleteUsers,
  login,
} from '../controllers/users-controllers';
import isLoggedIn from '../middlewares/login-required.handler';
import passport from 'passport';

const router = express.Router();

router.get('/', getAllUsers);

// 인가 관련 미들웨어 추가 필요
router.get('/profile', isLoggedIn, getUsers);

router.post('/signup', signup);

// 인가 관련 미들웨어 추가 필요
router.patch('/profile', isLoggedIn, updateUsers);

// 인가 관련 미들웨어 추가 필요
router.delete('/', isLoggedIn, deleteUsers);

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  login,
);

export default router;
