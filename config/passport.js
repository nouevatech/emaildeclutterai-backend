const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.metadata",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels",
      ],
      accessType: "offline",
      prompt: "consent",
    },
    function (accessToken, refreshToken, profile, done) {
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        accessToken,
        refreshToken,
      };

      // Save tokens/user in session manually via callback route
      return done(null, user);
    }
  )
);

// Store only user.id in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Only return { id } in deserialization for session validation
passport.deserializeUser((id, done) => {
  done(null, { id });
});
