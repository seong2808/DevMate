import passport from 'passport';
import local from './strategy/local';
import jwt from './strategy/jwt';

export default () => {
  passport.use(local);
  passport.use(jwt);
};
