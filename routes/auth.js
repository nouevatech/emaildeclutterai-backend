const express = require("express");
const passport = require("passport");

const router = express.Router();

// Step 1: Redirect to Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile", // Get user name & photo
      "email", // Get user email
      "https://www.googleapis.com/auth/gmail.metadata", // Access subjects/senders
      "https://www.googleapis.com/auth/gmail.modify", // Modify (delete/label)
      "https://www.googleapis.com/auth/gmail.labels", // Manage labels
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

// Step 2: Handle callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    // Extract user info safely
    const name =
      req.user.displayName ||
      req.user.profile?.displayName ||
      req.user._json?.name ||
      "";
    const email =
      req.user.email ||
      req.user.profile?.emails?.[0]?.value ||
      req.user._json?.email ||
      "";

    // Save to session
    req.session.user = {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      name,
      email,
    };

    console.log("Stored session user:", req.session.user);

    // Redirect to backend page to set cookie, then to frontend
    res.redirect("https://emaildeclutterai-frontend.vercel.app/connect");

    // Redirect to frontend
    //res.redirect("https://emaildeclutterai-frontend.vercel.app/connect");
  }
);

// Step 3: Logout
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

// Step 4: Auth Status (check if user is authenticated)
router.get("/status", (req, res) => {
  const user = req.user || req.session.user;
  if (user) {
    res.json({
      authenticated: true,
      user: {
        name: user.name || "",
        email: user.email || "",
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
