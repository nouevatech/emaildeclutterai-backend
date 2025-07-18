require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

require("./config/passport");
const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail");

const app = express();

// Warm
app.get("/warm", (req, res) => {
  console.log("Warm route hit");
  res.send("warmed");
});

//connect Db


mongoose.connect(process.env.MONGO_URI, {
  //serverSelectionTimeoutMS: 10000, 
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



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
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: true,       
      httpOnly: true,
      sameSite: "None",     
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());





// Assign session user to req.user
app.use((req, res, next) => {
  if (!req.user && req.session.user) {
    req.user = req.session.user;
  }
  next();
});


// Routes
app.use("/auth", authRoutes);
app.use("/gmail", gmailRoutes);

app.get("/", (req, res) => {
  res.send("EmailDeclutterAI backend is live.");
});


// Transitional page to set cookie before redirecting to frontend
app.get("/connect", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Connecting...</title></head>
      <body>
        <p style="font-family:sans-serif;">Redirecting to EmailDeclutterAI...</p>
        <script>
          // Redirect to the frontend dashboard
          window.location.href = "https://emaildeclutterai-frontend.vercel.app/dashboard";
        </script>
      </body>
    </html>
  `);
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
