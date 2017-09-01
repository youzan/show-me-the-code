import * as passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

const { APPLICATION } = eval('require')('../config/config');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GitHubStrategy({
    clientID: APPLICATION.GITHUB.ID,
    clientSecret: APPLICATION.GITHUB.SECRET,
    callbackURL: APPLICATION.GITHUB.CALLBACK
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
        console.log(profile)
        return done(null, {
            name: profile.displayName
        });
    });
}));

export default passport;
