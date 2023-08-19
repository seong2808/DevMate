import { Request, Response, NextFunction } from 'express';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new Error('인증되지 않은 유저입니다. 로그인 해주세요.');
  }
  next();
};

export default isLoggedIn;
