import express from 'express';
import {
  getAllUsers,
  getUsers,
  signup,
  updateUsers,
  deleteUsers,
  login,
} from '../controllers/users-controllers';
import passport from 'passport';

const router = express.Router();

router.get('/', getAllUsers);

router.get('/profile', getUsers);

router.post('/signup', signup);

router.patch('/profile', updateUsers);

router.delete('/', deleteUsers);

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  login,
);

export default router;
