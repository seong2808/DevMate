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
import validatePassword from '../middlewares/validate-password.handler';
import passport from 'passport';

const router = express.Router();

router.get('/', getAllUsers);

router.get('/profile', isLoggedIn, getUsers);

router.post('/signup', signup);

router.patch('/profile', isLoggedIn, updateUsers);

router.delete('/', isLoggedIn, validatePassword, deleteUsers);

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  login,
);

export default router;
