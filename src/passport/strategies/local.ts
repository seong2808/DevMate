import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import { HttpError } from '../../middlewares/error.handler';

const passportConfig = {
  usernameField: 'email',
  passwordField: 'password',
};

const local = new LocalStrategy(
  passportConfig,
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(new HttpError('회원을 찾을 수 없습니다.', 404));
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(new HttpError('비밀번호를 확인해주세요.', 401));
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

export default local;
