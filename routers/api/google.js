const express = require("express");
const router = express.Router();
const UserModel = require("../../models/User");
const passport = require("passport");
require("dotenv").config;

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.LOGIN_URL}`,
  }),
  async (req, res) => {
    try {
      const existingUser = await UserModel.findOne({ googleId: req.user.id });

      if (existingUser) {
        console.log(req.user);
        return res.redirect(`${process.env.HOMEPAGE_URL}/${req.user.id}`);
      }

      //   console.log(req.user.displayName);
      const newUser = new UserModel({
        googleUser: req.user.displayName,
        googleId: req.user.id,
        username: req.user.id,
      });

      await newUser.save();
      res.redirect(`${process.env.HOMEPAGE_URL}/${req.user.id}`);
    } catch (error) {
      console.error("Error creating or retrieving user:", error);
      res.redirect(`${process.env.LOGIN_URL}`);
    }
  }
);

module.exports = router;
