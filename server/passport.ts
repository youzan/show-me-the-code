import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

const { APPLICATION } = eval('require')('../config');

passport.use(new GitHubStrategy({
    clientID: APPLICATION.GITHUB.ID,
    clientSecret: APPLICATION.GITHUB.SECRET,
    callbackURL: APPLICATION.GITHUB.CALLBACK
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

export default passport;
