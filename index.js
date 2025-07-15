// index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const gmailRoutes = require('./routes/gmail');
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load Passport config
 require('./config/passport');

 const authRoutes = require('./routes/auth');


const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://emaildeclutterai-frontend.vercel.app'], 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res)=>{
  res.send('go andlogin')
})

//Route integration 
app.use('/auth', authRoutes);
app.use('/gmail', gmailRoutes);

console.log('CLIENT ID:', process.env.GOOGLE_CLIENT_ID);
console.log('SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('CALLBACK:', process.env.GOOGLE_CALLBACK_URL);



app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` EmailDeclutterAI server running on :${PORT}`);
});
