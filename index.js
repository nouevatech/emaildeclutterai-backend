require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const gmailRoutes = require("./routes/gmail");
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load Passport config
require("./config/passport");

const authRoutes = require("./routes/auth");

const app = express();

// Warm
app.get("/warm", (req, res) => {
  console.log("Warm route hit");
  res.send("warmed");
});

app.get("/test-ai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello world" }],
    });

    res.send(completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
    res.status(500).send("OpenAI error");
  }
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

app.get("/login", (req, res) => {
  res.send("go andlogin");
});

//Route integration
app.use("/auth", authRoutes);
app.use("/gmail", gmailRoutes);

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("CALLBACK:", process.env.GOOGLE_CALLBACK_URL);

app.get("/", (req, res) => {
  res.send("EmailDeclutterAI backend is live.");
});

app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`EmailDeclutterAI server running on :${PORT}`);
});
