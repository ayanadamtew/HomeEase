const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const prisma = require('./db');

// ─── JWT Strategy ────────────────────────────────────────────────
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: payload.id } });
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    })
);

// ─── Google OAuth Strategy ───────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'placeholder') {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists by googleId
                    let user = await prisma.user.findUnique({
                        where: { googleId: profile.id },
                    });

                    if (!user) {
                        // Check if user exists by email
                        const email = profile.emails?.[0]?.value;
                        user = await prisma.user.findUnique({ where: { email } });

                        if (user) {
                            // Link Google account to existing user
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    googleId: profile.id,
                                    avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                                },
                            });
                        } else {
                            // Create new user
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: profile.displayName,
                                    googleId: profile.id,
                                    avatarUrl: profile.photos?.[0]?.value,
                                    isVerified: true,
                                },
                            });
                        }
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, false);
                }
            }
        )
    );
}

module.exports = passport;
