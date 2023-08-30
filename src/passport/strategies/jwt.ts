import 'dotenv/config';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Request } from 'express';

const cookieExtractor = (req: Request) => {
  const { token } = req.cookies;
  return token;
};
const jwtConfig = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

const jwt = new JwtStrategy(jwtConfig, (jwtPayload, done) => {
  return done(null, jwtPayload);
});

export default jwt;
