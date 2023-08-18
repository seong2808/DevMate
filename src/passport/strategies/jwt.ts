import 'dotenv/config';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const jwtConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwt = new JwtStrategy(jwtConfig, (jwtPayload, done) => {
  return done(null, jwtPayload);
});

export default jwt;
