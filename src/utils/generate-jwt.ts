import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export type reqUser = {
  userId: mongoose.Types.ObjectId;
  email: string;
};

const generateJWT = (res: Response, user: reqUser) => {
  const payload = user;
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 1000, // 쿠키 만료 시간 1시간
    })
    .json({ message: '로그인 완료', error: null });
};

export default generateJWT;
