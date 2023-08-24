import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import groupRoutes from './routes/groupsRoutes';
import bodyParser from 'body-parser';

import usersRoutes from './routes/users-routes';
import passport from 'passport';
import passportIndex from './passport';
import getToken from './middlewares/get-token.handler';
import { errorHandler } from './middlewares/error.handler';

passportIndex();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(getToken);

app.use('/api/groups', groupRoutes);

app.use('/api/users', usersRoutes);

app.use(errorHandler);

const initServer = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://devmate:elice1234@devmate.eknxqd6.mongodb.net/devmate?retryWrites=true&w=majority',
    );
    console.log('DB 연결');
    const PORT = 8000;
    app.listen(PORT, () => {
      console.log(`서버 실행, 포트 : ${PORT}`);
    });
  } catch (err) {
    console.error('Mongoose error:', err);
    process.exit(1);
  }
};

initServer();
