const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5002;
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const userRouter = require("./routers/api/authRouter");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname+"/build")));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/build/index.html" );
})
app.get('/home/:id', (req, res) => {
  res.sendFile(__dirname + "/build/index.html" );
})
// app.get('*', (req, res) => {
//   res.sendFile(__dirname + "/build/index.html");
// });
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.CALLBACK_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.use("/api/notes", require("./routers/api/notes"));
app.use("/auth", userRouter);
app.use("/auth/google", require("./routers/api/google"));
app.use("/api/logout", require("./routers/api/logout"));

const dbUrl = process.env.MONGODB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
