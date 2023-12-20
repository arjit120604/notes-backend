const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.MONGODB_URL;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connection success");
  } catch (e) {
    console.error("Error", e);
  }
};

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  tag: String,
  user: String,
});

// const logSchema = new mongoose.Schema({
//   timestamp: { type: Date, default: Date.now },
//   method: String,
//   path: String,
// });

const Note = mongoose.model("Note", noteSchema);

// const Log = mongoose.model("Log", logSchema);

const insertNote = async (notes) => {
  try {
    const res = await Note.insertMany(notes);
    console.log("Note inserted:", res);
  } catch (e) {
    console.log(`error ${e}`);
  }
};

const displayAllNotes = async (username) => {
  try {
    const allNotes = await Note.find({ user: username });
    console.log("All Notes:", allNotes);
    return allNotes;
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};

const displayNoteById = async (id) => {
  try {
    const allNotes = await Note.find({ user: id });
    console.log("All Notes:", allNotes);
    return allNotes;
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
};

// const displayNoteById = async (noteId) => {
//   try {
//     // Check if noteId is a valid ObjectId
//     // if (!mongoose.Types.ObjectId.isValid(noteId)) {
//     //   // Treat it as a search query instead
//     //   const notesBySearch = await Note.find({
//     //     $or: [{ title: noteId }, { content: noteId }],
//     //   });

//     //   if (notesBySearch.length === 0) {
//     //     console.log(`No notes found with title or content: ${noteId}`);
//     //     return null;
//     //   }

//     //   console.log(`Notes by Title or Content (${noteId}):`, notesBySearch);
//     //   return notesBySearch;
//     // }

//     // If noteId is a valid ObjectId, proceed with finding by ID
//     const note = await Note.findById(noteId);

//     if (!note) {
//       console.log(`No note found with ID: ${noteId}`);
//       return null;
//     }

//     console.log("Note by ID:", note);
//     return note;
//   } catch (error) {
//     console.error("Error fetching note by ID:", error);
//   }
// };

const displayNotesByTag = async (tag) => {
  try {
    const notesByTag = await Note.find({ tag });

    if (notesByTag.length === 0) {
      console.log(`No notes found with tag: ${tag}`);
      return null;
    }

    console.log(`Notes by Tag (${tag}):`, notesByTag);
    return notesByTag;
  } catch (error) {
    console.error("Error fetching notes by tag:", error);
  }
};

const deleteNoteById = async (noteId) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      console.log(`No note found with ID: ${noteId}`);
      return null;
    }

    console.log("Deleted Note:", deletedNote);
    return deletedNote;
  } catch (error) {
    console.error("Error deleting note by ID:", error);
  }
};

const deleteNoteByTitle = async (noteTitle) => {
  try {
    const deletedNote = await Note.deleteOne({ title: noteTitle });

    if (!deletedNote) {
      console.log(`No note found with title: ${noteTitle}`);
      return null;
    }

    console.log("Deleted Note by Title:", deletedNote);
    return deletedNote;
  } catch (error) {
    console.error("Error deleting note by title:", error);
  }
};

const insertOneNote = async (newNote) => {
  try {
    const noteInstance = new Note(newNote);

    const savedNote = await noteInstance.save();

    console.log("Added Note:", savedNote);
    return savedNote;
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

const updateNote = async (noteId, updatedNoteData) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(noteId, updatedNoteData, {
      new: true,
    });

    if (!updatedNote) {
      console.log(`No note found with ID: ${noteId}`);
      return null;
    }

    console.log("Updated Note:", updatedNote);
    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

// const insertLog = async (method, path) => {
//   try {
//     const logEntry = new Log({ method: method, path: path });
//     const addedLog = await logEntry.save();
//     console.log("Log entry added:", addedLog);
//   } catch (error) {
//     console.error("Error adding log entry:", error);
//   }
// };

module.exports = {
  connectToDatabase,
  insertNote,
  displayAllNotes,
  displayNoteById,
  displayNotesByTag,
  deleteNoteById,
  deleteNoteByTitle,
  insertOneNote,
  updateNote,

  //   insertLog,
};
