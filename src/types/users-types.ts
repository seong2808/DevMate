import { Schema } from 'mongoose';

export interface IUser {
  email: string;
  nickname: string;
  password: string;
  profileImage?: string;
  overview?: string;
  skills: string[];
  links: {
    gitHub?: string;
    blog?: string;
  };
  wishList: (typeof Schema.Types.ObjectId)[];
}

export interface reqUserInfo {
  userId: string;
  email: string;
}
