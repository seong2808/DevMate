import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User';

//사용자 정보 조회
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await User.find();
  res.json({ users: users });
};

//사용자 회원가입
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, nickName, password } = req.body;
  const createdUser = new User({ email, nickName, password });
  const users = await createdUser.save();
  res.json({ message: 'Sign up' });
};

//사용자 정보 수정
export const updateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await User.find();
  res.json({ users: users });
};

//사용자 정보 삭제(탈퇴)
export const deleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.body.id;
  console.log(userId);

  const users = await User.findByIdAndDelete(userId);

  res.json({ message: 'Delete' });
};
