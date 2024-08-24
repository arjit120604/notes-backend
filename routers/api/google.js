const express = require("express");
const router = express.Router();
const UserModel = require("../../models/User");
const passport = require("passport");
require("dotenv").config();

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: `/`,
  }),
  async (req, res) => {
    try {
      const existingUser = await UserModel.findOne({ googleId: req.user.id });

      if (existingUser) {
        console.log(req.user);
        // console.log(req.isAuthenticated());
        return res.redirect(`/home/${req.user.id}`);
      }

      //   console.log(req.user.displayName);
      const newUser = new UserModel({
        googleUser: req.user.displayName,
        googleId: req.user.id,
        username: req.user.id,
      });

      await newUser.save();
      res.redirect(`/home/${req.user.id}`);
    } catch (error) {
      console.error("Error creating or retrieving user:", error);
      res.redirect(`/`);
    }
  }
);

module.exports = router;
