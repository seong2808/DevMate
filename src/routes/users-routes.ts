import express from 'express';
import {
  getUsers,
  signup,
  updateUsers,
  deleteUsers,
} from '../controllers/users-controllers';

const router = express.Router();

router.get('/', getUsers);

router.post('/signup', signup);

router.delete('/', deleteUsers);

export default router;
