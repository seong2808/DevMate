import 'dotenv/config';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

const cookieExtractor = (req: Request) => {
  const { token } = req.cookies;
  return token;
};
const jwtConfig = {
  jwtFromRequest: cookieExtractor,
  // ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwt = new JwtStrategy(jwtConfig, (jwtPayload, done) => {
  return done(null, jwtPayload);
});

export default jwt;
