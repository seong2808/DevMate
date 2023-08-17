import express, { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import generateJWT from '../utils/generate-jwt';

//전체 사용자 정보 조회 (추후 삭제 예정)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await User.find();
  res.json({ users: users });
};

interface temp {
  _id: string;
  email: string;
}

// 사용자 로그인 (임시 api)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { _id, email }: { _id: string; email: string } = req.body;
    const user = { _id: _id, email: email };
    generateJWT(res, user);
  } catch (err) {
    return next(err);
  }
};

//사용자 정보 조회
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id }: IUser = req.body;
  try {
    const users = await User.findById(id);
    res.json({ users: users });
  } catch (err) {
    return next(err);
  }
};

//사용자 회원가입
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, nickName, password }: IUser = req.body;

  // 이미 존재하는 닉네임/이메일 체크
  // 이메일 형식 validation 필요
  let existingUser: IUser | null;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }

  if (existingUser) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  const createdUser = new User({ email, nickName, password });
  try {
    await createdUser.save();
  } catch (err) {
    return next(err);
  }

  res.json({ message: 'Sign up' });
};

//사용자 정보 수정
export const updateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId: string = req.body.id;
  const updates: IUser = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.json({ message: 'update success!' });
  } catch (err) {
    return next(err);
  }
};

//사용자 정보 삭제(탈퇴)
export const deleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId: string = req.body.id;
    const users = await User.findByIdAndDelete(userId);
    res.json({ message: 'Delete user.' });
  } catch (err) {
    return next(err);
  }
};
