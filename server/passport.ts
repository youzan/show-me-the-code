import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

import { APPLICATION } from '../config';

const GITHUB_CLIENT_ID = '';
const GITHUB_CLIENT_SECRET = '';

passport.use(new GitHubStrategy({
    clientID: APPLICATION.GITHUB.ID,
    clientSecret: APPLICATION.GITHUB.SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

export default passport;
