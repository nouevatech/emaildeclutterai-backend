const express = require("express");
const passport = require("passport");

const router = express.Router();

// Step 1: Redirect to Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    accessType: "offline",
    prompt: "consent",
  })
);

// Step 2: Handle callback from Google
/*
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "https://emaildeclutterai-frontend.vercel.app/connect",
    // successRedirect: "http://localhost:5126/connect",
    session: true,
  }),
  (err, req, res, next) => {
    console.log("ACCESS TOKEN:", req.user.accessToken); 
    console.error("OAuth callback error:", err); // Log deeper error if needed
    next(err);
  }
);*/

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://emaildeclutterai-frontend.vercel.app",
    session: true,
  }),
  (req, res) => {
    console.log("✅ ACCESS TOKEN:", req.user.accessToken); 
    res.redirect("https://emaildeclutterai-frontend.vercel.app/connect");
  }
);



// Step 3: Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failed.");
    }
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

// Auth status
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        name: req.user.displayName,
        email: req.user.email,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
