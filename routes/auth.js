const express = require('express');
const passport = require('passport');

const router = express.Router();

// Step 1: Redirect to Google OAuth
router.get('/google', passport.authenticate('google'));

// Step 2: Handle callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/dashboard' 
  })
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
