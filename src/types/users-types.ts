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
  createdGroup: typeof Schema.Types.ObjectId;
  wishList: (typeof Schema.Types.ObjectId)[];
  endGroup: (typeof Schema.Types.ObjectId)[];
  ongoingGroup: (typeof Schema.Types.ObjectId)[];
  joinRequestGroup: (typeof Schema.Types.ObjectId)[];

  notifications: (typeof Schema.Types.ObjectId)[];
}

export interface reqUserInfo {
  userId: string;
  email: string;
}
