require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");

require("./config/passport");
const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail");

const app = express();

// Warm
app.get("/warm", (req, res) => {
  console.log("Warm route hit");
  res.send("warmed");
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5126",
      "https://emaildeclutterai-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/gmail", gmailRoutes);

app.get("/", (req, res) => {
  res.send("EmailDeclutterAI backend is live.");
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on :${PORT}`);
});
