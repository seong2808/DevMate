import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const generateJWT = (res: Response, user: { _id: string; email: string }) => {
  const payload = {
    _id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string);
  res.cookie('token', token);
};

export default generateJWT;
