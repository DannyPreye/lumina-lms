import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request } from 'express';
import { config } from '../config/env.config';
import { User } from '../modules/users/user.model';
import { StudentProfile } from '../modules/users/student-profile.model';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: config.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
        },
        async (req: Request, accessToken, refreshToken, profile, done) =>
        {
            try {
                // 1. Enforce Tenant Context
                const tenant = (req as any).tenant;
                if (!tenant) {
                    return done(new Error('Authentication requires a valid tenant context.'));
                }

                const email = profile.emails?.[ 0 ].value;
                if (!email) {
                    return done(new Error('No email found in Google profile'));
                }

                // 2. Find User Scoped to Tenant
                let user = await User.findOne({ email, tenantId: tenant._id });

                if (!user) {
                    // 3. Create User Scoped to Tenant
                    user = await User.create({
                        email,
                        passwordHash: 'oauth_user', // Placeholder
                        emailVerified: true,
                        roles: [ 'student' ],
                        signInMethod: 'google',
                        tenantId: tenant._id,
                    });

                    // 4. Create Student Profile
                    await StudentProfile.create({
                        user: user._id,
                        firstName: profile.name?.givenName || 'New',
                        lastName: profile.name?.familyName || 'User',
                        displayName: profile.displayName || profile.name?.givenName || 'User',
                        avatar: profile.photos?.[ 0 ].value,
                        tenantId: tenant._id,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

// Serialization (JWT approach usually skips this, but kept for compatibility)
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
