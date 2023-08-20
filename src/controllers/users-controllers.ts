import express, { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import generateJWT, { reqUser } from '../utils/generate-jwt';
import hashPassword from '../utils/hash-password';

//전체 사용자 정보 조회 (추후 삭제 예정)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await User.find();
  res.json({ users: users });
};

// 사용자 로그인 (임시 api)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email: string = req.body.email;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return;
    }
    const userId: string = foundUser._id;
    const user = { userId: userId, email: email };
    generateJWT(res, user);
  } catch (err) {
    return next(err);
  }
};

// 추후 따로 interface 분리 필요
interface UserInfo {
  user: { userId: string; email: string };
}

//사용자 정보 조회
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    console.log('no req user'); //임시 확인용. 추후 수정 예정
    return;
  }
  const userInfo = req.user as UserInfo;
  // 왜 이런 형태(userInfo.user.userId)로 나오는지 req.user에 들어가는 정보 확인 필요
  const userId: string = userInfo.user.userId;
  console.log(userInfo); // 추후 삭제 예정

  try {
    const foundUser = await User.findById(userId);
    res.json({ users: foundUser });
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

  const hashedPassword = await hashPassword(password);
  const createdUser = new User({ email, nickName, password: hashedPassword });
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
