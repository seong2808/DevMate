import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

const getToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies.token) {
    next();
    return;
  }

  passport.authenticate('jwt', { session: false })(req, res, next);
};

export default getToken;
