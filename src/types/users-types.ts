import { Schema } from 'mongoose';

export interface IUser {
  email: string;
  nickName: string;
  password: string;
  profileImage?: string;
  overView?: string;
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
