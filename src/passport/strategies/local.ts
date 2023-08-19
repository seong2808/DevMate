import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../../models/User';

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
        return done(null, false, { message: '회원을 찾을 수 없습니다.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: '비밀번호 에러' });
      }

      console.log(user, password, user.password, isPasswordValid);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

export default local;
