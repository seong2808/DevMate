import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../../models/User'; // 사용자 모델 경로로 수정

const local = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
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

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

export default local;
