const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5002;
const path = require("path");
const cors = require("cors");
const userRouter = require("./routers/api/authRouter");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/notes", require("./routers/api/notes"));
app.use("/auth", userRouter);

const dbUrl = process.env.MONGODB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
