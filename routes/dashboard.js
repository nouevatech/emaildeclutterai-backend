/*const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google');
}

// Gmail fetch route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get list of recent email IDs (only metadata, no body)
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = listRes.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });

        const headers = msgRes.data.payload.headers;
        const email = {
          id: msg.id,
          subject: headers.find((h) => h.name === 'Subject')?.value || '',
          from: headers.find((h) => h.name === 'From')?.value || '',
          date: headers.find((h) => h.name === 'Date')?.value || '',
        };

        return email;
      })
    );

    res.json({ user: req.user.name, emails });
  } catch (err) {
    console.error('Error fetching emails:', err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

module.exports = router;
*/
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