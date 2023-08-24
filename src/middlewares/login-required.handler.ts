import { Request, Response, NextFunction } from 'express';
import { HttpError } from './error.handler';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(
      new HttpError('인증되지 않은 유저입니다. 로그인 해주세요.', 401),
    );
  }
  next();
};

export default isLoggedIn;
