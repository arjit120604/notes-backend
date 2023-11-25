const express = require("express");
// const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5002;
const path = require("path");
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/notes", require("./routers/api/notes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
