const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: false },
  password: { type: String, required: false },
  googleId: { type: Number, required: false },
  googleUser: { type: String, required: false, unique: false },
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
