import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  user: {
    userId: Types.ObjectId;
  };
}