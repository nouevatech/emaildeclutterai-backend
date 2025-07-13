/*
const https = require("https");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const OAuth2 = require("oauth").OAuth2;

// ✅ Custom agent to bypass cert verification (for ZScaler or self-signed)
const customAgent = new https.Agent({
  rejectUnauthorized: false,
});

// ✅ Patch both internal methods to use the custom agent
const originalGetOAuthAccessToken = OAuth2.prototype.getOAuthAccessToken;
OAuth2.prototype.getOAuthAccessToken = function (...args) {
  this._requestAgent = customAgent;
  return originalGetOAuthAccessToken.apply(this, args);
};

const originalRequest = OAuth2.prototype._request;
OAuth2.prototype._request = function (
  method,
  url,
  headers,
  post_body,
  access_token,
  callback
) {
  this._requestAgent = customAgent;
  return originalRequest.call(
    this,
    method,
    url,
    headers,
    post_body,
    access_token,
    callback
  );
};

// ✅ Google Strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      accessType: "offline",
      prompt: "consent",
      passReqToCallback: false,
    },
    function (accessToken, refreshToken, profile, done) {
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        accessToken,
        refreshToken,
      };
      console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
      console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

      console.log("GOOGLE PROFILE:", profile);
      console.log("ACCESS TOKEN:", accessToken);
      console.log("REFRESH TOKEN:", refreshToken);
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
*/
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      accessType: "offline",
      prompt: "consent",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("GOOGLE PROFILE:", profile);
      console.log("ACCESS TOKEN:", accessToken);
      console.log("REFRESH TOKEN:", refreshToken);

      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        accessToken,
        refreshToken,
      };

      done(null, user); // ✅ only once
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

