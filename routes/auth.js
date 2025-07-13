const express = require('express');
const passport = require('passport');

const router = express.Router();

// Step 1: Redirect to Google OAuth
router.get('/google', passport.authenticate('google', {
  accessType: 'offline',
  prompt: 'consent'
}));


// Step 2: Handle callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/dashboard',
    session: true
  }),
  (err, req, res, next) => {
    console.error("OAuth callback error:", err); // Log deeper error if needed
    next(err);
  }
);


// Step 3: Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).send('Logout failed.');
    }
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

module.exports = router;

