import 'dotenv/config';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const jwt = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  (jwtPayload, done) => {
    return done(null, jwtPayload);
  },
);

export default jwt;
