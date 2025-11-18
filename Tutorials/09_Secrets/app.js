require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});
userSchema.set("strictQuery", true);

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  const callbackURL = process.env.CALLBACK_URL || "http://localhost:3000/auth/google/secrets";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      function (accessToken, refreshToken, profile, cb) {
        (async () => {
          try {
            const foundUser = await User.findOne({ googleId: profile.id }).exec();
            if (foundUser) return cb(null, foundUser);
            const newUser = new User({ googleId: profile.id });
            await newUser.save();
            return cb(null, newUser);
          } catch (err) {
            return cb(err);
          }
        })();
      }
    )
  );
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/secrets");
  }
);

app.get("/secrets", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const foundUsers = await User.find({ secret: { $ne: null } }).exec();
      res.render("secrets", { usersWithSecrets: foundUsers });
    } catch (err) {
      console.error(err);
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/secrets",
      failureRedirect: "/login",
    })
  );

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        return res.redirect("/register");
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    });
  });

app
  .route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  })
  .post(async (req, res) => {
    console.log(req.body.secret);
    if (req.isAuthenticated()) {
      try {
        const foundUser = await User.findById(req.user.id).exec();
        if (foundUser) {
          foundUser.secret = req.body.secret;
          await foundUser.save();
          res.redirect("/secrets");
        } else {
          res.redirect("/login");
        }
      } catch (err) {
        console.error(err);
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  });

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});
