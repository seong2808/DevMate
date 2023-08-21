import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { reqUserInfo } from '../types/users-types';
import bcrypt from 'bcrypt';

const validatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.user as reqUserInfo;
  const foundUser = await User.findById(userId);
  const { password } = req.body;
  if (!foundUser) {
    return; //에러 처리 필요
  }
  const isPasswordValid = await bcrypt.compare(password, foundUser.password); //유저 입력 패스워드와 DB 패스워드 비교

  if (!isPasswordValid) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }
  next();
};

export default validatePassword;
