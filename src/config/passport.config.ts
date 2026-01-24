import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config/env.config';
import { User } from '../modules/users/user.model';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) =>
        {
            try {
                const email = profile.emails?.[ 0 ].value;
                if (!email) {
                    return done(new Error('No email found in Google profile'));
                }

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        email,
                        passwordHash: 'oauth_user', // Placeholder, user logs in via OAuth
                        profile: {
                            firstName: profile.name?.givenName || 'New',
                            lastName: profile.name?.familyName || 'User',
                            displayName: profile.displayName,
                            avatar: profile.photos?.[ 0 ].value,
                        },
                        emailVerified: true,
                        roles: [ 'student' ],
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

// We are using JWT, so we don't necessarily need session-based serialization,
// but Passport requires these if session is not false.
passport.serializeUser((user: any, done) =>
{
    done(null, user.id);
});

passport.deserializeUser(async (id, done) =>
{
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
