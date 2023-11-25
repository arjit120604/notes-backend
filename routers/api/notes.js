const express = require("express");
const router = express.Router();
const notes = require("../../Notes");
const uuid = require("uuid");
const morgan = require("morgan");
const winston = require("winston");
require("winston-mongodb");
const fs = require("fs");
const path = require("path");

notes.connectToDatabase();

//middleware to log
// router.use((req, res, next) => {
//   notes.insertLog(req.method, req.path);
//   next();
// });

//morgan to log CRUD requests to a local file
const accessLogStream = fs.createWriteStream(
  path.join(__filename, "../../../logger.log"),
  { flags: "a" }
);

router.use(morgan("combined", { stream: accessLogStream }));

//using morgan to log CRUD reqs to mongoDB
// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.MongoDB({
//       db: "mongodb+srv://arjit:arjit1206@cluster0.iret1e1.mongodb.net/notes",
//       options: { useNewUrlParser: true, useUnifiedTopology: true },
//       collection: "logs",
//     }),
//   ],
// });

// router.use(
//   morgan("combined", { stream: { write: (message) => logger.info(message) } })
// );

// GET all notes
router.get("/", async (req, res) => {
  const allNotes = await notes.displayAllNotes();
  res.json(allNotes);
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
  const newNote = {
    id: uuid.v4(),
    title: req.body.title,
    content: req.body.content,
    tag: req.body.tag,
  };

  if (!newNote.title || !newNote.content || !newNote.tag) {
    return res.status(400).json({ msg: `Please send title, content, and tag` });
  } else {
    try {
      const addedNote = await notes.insertOneNote(newNote);
      res.json(addedNote);
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
});

// DELETE note via ID
router.delete("/:id", async (req, res) => {
  const deletedNote = await notes.deleteNoteById(req.params.id);

  if (deletedNote) {
    res.json({ msg: "Note deleted successfully", deletedNote });
  } else {
    res.status(400).json({
      msg: `Note ${req.params.id} not found or could not be deleted`,
    });
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
router.put("/:id", async (req, res) => {
  const noteId = req.params.id;
  const updatedNoteData = req.body;

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
});

module.exports = router;
