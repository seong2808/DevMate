import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const generateJWT = (res: Response, email: string) => {
  const payload = { email };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
  res.cookie('token', token);
};

export default generateJWT;
