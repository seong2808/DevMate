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
      return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
    }
    const userId = foundUser._id;
    const user = { userId: userId, email: email };
    generateJWT(res, user);
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
  }
};

//내 정보 조회 API
export const getMyprofile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(
      new HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401),
    );
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;

  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
    }

    res.json({ users: foundUser });
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
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

    if (!foundUser) {
      return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
    }

    res.json({ users: foundUser });
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
  }
};

//사용자 회원가입 API
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, nickname, password }: IUser = req.body;

  // 이미 존재하는 이메일 체크
  // 이메일 형식 validation 필요
  let existingUser: IUser | null;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError('서버 에러 발생', 500));
  }

  if (existingUser) {
    return next(new HttpError('이미 존재하는 이메일입니다.', 409));
  }

  const hashedPassword = await hashPassword(password);
  const createdUser = new User({ email, nickname, password: hashedPassword });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
  }

  res.json({ message: 'Sign up' });
};

//사용자 정보 수정 API (완료)
export const updateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(
      new HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401),
    );
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;

  const updates: IUser = req.body;

  // 비밀번호 변경시 에러처리
  if (updates.password) {
    // updates.password = await hashPassword(updates.password);
    return next(
      new HttpError('요청에서 허용되지 않는 정보를 포함하고 있습니다.', 400),
    );
  }

  updates.profileImage = req.file ? req.file.path : ''; // 이미지 파일 처리

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.json({ message: 'update success!' });
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
  }
};

//사용자 정보 삭제(탈퇴) API (완료)
export const deleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(
      new HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401),
    );
  }
  const userTokenInfo = req.user as reqUserInfo;
  const userId: string = userTokenInfo.userId;

  try {
    const userToDelete = await User.findByIdAndDelete(userId);
    res.json({ message: 'Delete success' });
  } catch (err) {
    const error = new HttpError('서버 에러 발생', 500);
    return next(error);
  }
};
