import express from 'express';
import {
  getAllUsers,
  getUsers,
  signup,
  updateUsers,
  deleteUsers,
} from '../controllers/users-controllers';

const router = express.Router();

router.get('/', getAllUsers);

router.get('/profile', getUsers);

router.post('/signup', signup);

router.patch('/profile', updateUsers);

router.delete('/', deleteUsers);

export default router;
