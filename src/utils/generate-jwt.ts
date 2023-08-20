import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type reqUser = {
  userId: string;
  email: string;
};

const generateJWT = (res: Response, user: reqUser) => {
  const payload = { user };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  res.cookie('token', token).json({ message: 'logged In!!!' });
};

export default generateJWT;
