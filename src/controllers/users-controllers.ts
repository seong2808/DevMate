import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { IUser, reqUserInfo } from '../types/users-types';
import generateJWT from '../utils/generate-jwt';
import hashPassword from '../utils/hash-password';
import { HttpError } from '../middlewares/error.handler';

//전체 사용자 정보 조회 (추후 삭제 예정)
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await User.find();
  res.json({ users: users });
};

// 사용자 로그인 API
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
    const userId = foundUser._id;
    const user = { userId: userId, email: email };
    generateJWT(res, user);
  } catch (err) {
    return next(err);
  }
};

//내 정보 조회 API
export const getMyprofile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return; //에러 처리 필요
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;

  try {
    const foundUser = await User.findById(userId);
    res.json({ users: foundUser });
  } catch (err) {
    return next(err);
  }
};

//다른 유저 정보 조회 API
export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId: string = req.params.userId;

  try {
    const foundUser = await User.findById(userId);
    res.json({ users: foundUser });
  } catch (err) {
    return next(err);
  }
};

//사용자 회원가입 API
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, nickname, password }: IUser = req.body;

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
  const createdUser = new User({ email, nickname, password: hashedPassword });
  try {
    await createdUser.save();
  } catch (err) {
    return next(err);
  }

  res.json({ message: 'Sign up' });
};

//사용자 정보 수정 API
export const updateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return; //에러 처리 필요
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;

  const updates: IUser = req.body;

  // 비밀번호 변경시 에러처리
  if (updates.password) {
    // updates.password = await hashPassword(updates.password);
    throw Error('error');
  }
  // 이미지 파일 처리
  updates.profileImage = req.file ? req.file.path : '';

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.json({ message: 'update success!' });
  } catch (err) {
    return next(err);
  }
};

//사용자 정보 삭제(탈퇴) API
export const deleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return; //에러 처리 필요
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;
  console.log(req.user); // 추후 삭제 예정

  try {
    const userToDelete = await User.findByIdAndDelete(userId);
    res.json({ message: 'Delete success' });
  } catch (err) {
    return next(err);
  }
};
