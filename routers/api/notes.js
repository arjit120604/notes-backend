const express = require("express");
const router = express.Router();
const notes = require("../../Notes");
const uuid = require("uuid");
const morgan = require("morgan");
const winston = require("winston");
require("winston-mongodb");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/User");
const jwt_decode = require("jwt-decode");

require("dotenv").config();

notes.connectToDatabase();

//middleware to log
// router.use((req, res, next) => {
//   notes.insertLog(req.method, req.path);
//   next();
// });

// morgan to log CRUD requests to a local file(local host)
// const accessLogStream = fs.createWriteStream(
//   path.join(__filename, "../../../logger.log"),
//   { flags: "a" }
// );

// router.use(morgan("combined", { stream: accessLogStream }));

//using morgan to log CRUD reqs to mongoDB
const logger = winston.createLogger({
  transports: [
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URL,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      collection: "logs",
    }),
  ],
});

router.use(
  morgan("combined", { stream: { write: (message) => logger.info(message) } })
);

// GET all notes
router.get("/", async (req, res) => {
  const token = req.headers["x-access-token"];
  // console.log(token);

  try {
    const decoded = jwt.verify(token, "secret");
    const usernam = decoded.username;
    const user = await UserModel.findOne({ username: usernam });

    const allNotes = await notes.displayAllNotes(usernam);
    res.json({ status: "ok", quote: user.quote, notes: allNotes });
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: "error", error: "invalid token" });
  }
});

// router.post("/log", async (req, res) => {
//   const logMessage = req.body.message;

//   if (!logMessage) {
//     return res.status(400).json({ msg: "Please provide a log message" });
//   }

//   try {
//     await notes.insertLog(logMessage);
//     res.json({ msg: "Log entry added successfully" });
//   } catch (error) {
//     console.error("Error adding log entry:", error);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// });

// GET note via id
router.get("/:id", async (req, res) => {
  const found = await notes.displayNoteById(req.params.id);
  if (found) {
    res.json(found);
  } else {
    res.status(400).json({ msg: `Note ${req.params.id} not found` });
  }
});

// GET note via tag
router.get("/tag/:tag", async (req, res) => {
  const found = await notes.displayNotesByTag(req.params.tag);

  if (found) {
    res.json(found);
  } else {
    res.status(400).json({ msg: `Tag ${req.params.tag} not found` });
  }
});

// POST, single add
router.post("/", async (req, res) => {
  const token = req.headers["x-access-token"];
  console.log(token);

  try {
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", error: "Token not provided" });
    }
    const decoded = jwt.verify(token, "secret");
    const usernam = decoded.username;

    // const parseJwt = (token) => {
    //   try {
    //     return JSON.parse(atob(token.split(".")[1]));
    //   } catch (e) {
    //     return null;
    //   }
    // };

    // const usernam = parseJwt(token).username;
    console.log(`decoded`, usernam);
    const user = await UserModel.findOne({ username: usernam });

    if (!user) {
      return res.status(401).json({ status: "error", error: "User not found" });
    }

    const newNote = {
      title: req.body.title,
      content: req.body.content,
      tag: req.body.tag,
      user: usernam,
    };

    if (!newNote.title || !newNote.content) {
      return res.status(400).json({
        status: "error",
        error: "Please send title, content, and tag",
      });
    }

    try {
      const addedNote = await notes.insertOneNote(newNote);
      res.json({ status: "ok", note: addedNote });
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: "error", error: "Invalid token" });
  }
});

// add request for google
router.post("/:id", async (req, res) => {
  const id = req.params.id;

  const user = await UserModel.findOne({ googleId: id });

  if (!user) {
    return res.status(401).json({ status: "error", error: "User not found" });
  }

  const newNote = {
    title: req.body.title,
    content: req.body.content,
    tag: req.body.tag,
    user: id,
  };

  if (!newNote.title || !newNote.content) {
    return res.status(400).json({
      status: "error",
      error: "Please send title, content, and tag",
    });
  }

  try {
    const addedNote = await notes.insertOneNote(newNote);
    res.json({ status: "ok", note: addedNote });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
});

// DELETE note via ID
// router.delete("/:id", async (req, res) => {
//   const deletedNote = await notes.deleteNoteById(req.params.id);

//   if (deletedNote) {
//     res.json({ msg: "Note deleted successfully", deletedNote });
//   } else {
//     res.status(400).json({
//       msg: `Note ${req.params.id} not found or could not be deleted`,
//     });
//   }
// });

router.delete("/:id", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    // const parseJwt = (token) => {
    //   try {
    //     return JSON.parse(atob(token.split(".")[1]));
    //   } catch (e) {
    //     return null;
    //   }
    // };

    const decoded = jwt.verify(token, "secret");
    const usernam = decoded.username;

    // const usernam = parseJwt(token).username;
    // console.log(`decoded`, usernam);
    const user = await UserModel.findOne({ username: usernam });

    if (user) {
      const deletedNote = await notes.deleteNoteById(req.params.id);

      if (deletedNote) {
        res.json({ msg: "Note deleted successfully", deletedNote });
      } else {
        res.status(400).json({
          msg: `Note ${req.params.id} not found or could not be deleted`,
        });
      }
    } else {
      res.status(400).json({ msg: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

router.delete("/:googleId/:id", async (req, res) => {
  try {
    const usernam = req.params.googleId;

    const user = await UserModel.findOne({ googleId: usernam });

    if (user) {
      const deletedNote = await notes.deleteNoteById(req.params.id);

      if (deletedNote) {
        res.json({ msg: "Note deleted successfully", deletedNote });
      } else {
        res.status(400).json({
          msg: `Note ${req.params.id} not found or could not be deleted`,
        });
      }
    } else {
      res.status(400).json({ msg: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// DELETE note by title
router.delete("/title/:title", async (req, res) => {
  const deletedNote = await notes.deleteNoteByTitle(req.params.title);

  if (deletedNote) {
    res.json({ msg: "Note deleted successfully", deletedNote });
  } else {
    res.status(400).json({
      msg: `Note "${req.params.title}" not found or could not be deleted`,
    });
  }
});

//POST via id
// router.put("/:id", async (req, res) => {
//   const noteId = req.params.id;
//   const updatedNoteData = req.body;

//   try {
//     const updatedNote = await notes.updateNote(noteId, updatedNoteData);
//     if (updatedNote) {
//       res.json(updatedNote);
//     } else {
//       res.status(404).json({ msg: `Note with ID ${noteId} not found` });
//     }
//   } catch (error) {
//     console.error("Error updating note:", error);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// });

// PUT note via ID
router.put("/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  const noteId = req.params.id;
  const updatedNoteData = req.body;

  try {
    // const parseJwt = (token) => {
    //   try {
    //     return JSON.parse(atob(token.split(".")[1]));
    //   } catch (e) {
    //     return null;
    //   }
    // };

    // const usernam = parseJwt(token).username;
    // console.log(`decoded`, usernam);
    const decoded = jwt.verify(token, "secret");
    const usernam = decoded.username;
    const user = await UserModel.findOne({ username: usernam });

    if (user) {
      try {
        const updatedNote = await notes.updateNote(noteId, updatedNoteData);
        if (updatedNote) {
          res.json(updatedNote);
        } else {
          res.status(404).json({ msg: `Note with ID ${noteId} not found` });
        }
      } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ msg: "Internal Server Error" });
      }
    } else {
      res.status(400).json({ msg: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

//put for google
router.put("/:googleId/:id", async (req, res) => {
  const noteId = req.params.id;
  const updatedNoteData = req.body;

  try {
    const usernam = req.params.googleId;
    const user = await UserModel.findOne({ googleId: usernam });

    if (user) {
      try {
        const updatedNote = await notes.updateNote(noteId, updatedNoteData);
        if (updatedNote) {
          res.json(updatedNote);
        } else {
          res.status(404).json({ msg: `Note with ID ${noteId} not found` });
        }
      } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ msg: "Internal Server Error" });
      }
    } else {
      res.status(400).json({ msg: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

module.exports = router;
