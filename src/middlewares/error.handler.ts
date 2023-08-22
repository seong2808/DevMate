import { Request, Response, NextFunction } from 'express';

export interface Error {
  code: number;
  message: string;
}

export interface HttpError {
  code: number;
  message: string;
}

export class HttpError extends Error {
  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
};
