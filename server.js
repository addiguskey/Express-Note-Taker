const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require("./helpers/uuid");

//parsedNotes defined on line 105 in  udateDb funciton
let parsedNotes;
// newNote defined on line 67
let newNote;
//noteId defined on line 46
let noteId;

const PORT = process.env.PORT || 3001;
const app = express();

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//GET "/notes" should return notes.html
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

//When a new note is saved, this GET request appends the new note on the left side bar
app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      consolg.error(err);
    } else {
      res.status(200).json(JSON.parse(data));
    }
  });
});

// GET  a single note
app.get("/api/notes/:id", (req, res) => {
  if (req.params.id) {
    console.info(`${req.method} request received to get a single note`);
    noteId = req.params.id;
    let notes = require("./db/db.json");

    for (let i = 0; i < notes.length; i++) {
      const currentNote = notes[i];
      if (currentNote.id === noteId) {
        res.status(200).json(currentNote);
        return;
      }
    }
    res.status(404).send("Note not founud");
  } else {
    res.status(400).send("Note ID not provided");
  }
});

//POST for new note with a random id, adding it to db.json
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (title && text) {
    newNote = {
      title,
      text,
      id: uuid(),
    };
    updateDb();
    const response = {
      status: "sucess",
      body: newNote,
    };
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

//POST request for a single review
app.post("/api/notes/:id", (req, res) => {
  if (req.body && req.params.id) {
    console.info(`${req.method} request received to post a new note`);
    let notes = require("./db/db.json");
    const noteId = req.params.id;
    for (let i = 0; i < notes.length; i++) {
      const currentNote = notes[i];
      if (currentNote.id === noteId) {
        return;
      }
    }
    res.status(404).json("Note ID not found");
  }
});

//DELETE
app.delete("/api/notes/:id", (req, res) => {
  fs.readFile("db/db.json", "utf8", (err, data) => {
    let noteId = req.params.id;
    let updatedNotes = JSON.parse(data).filter((note) => {
      console.log("note.id", note.id);
      console.log("noteId", noteId);
      return note.id !== noteId;
    });
    let notes = require("./db/db.json");
    notes = updatedNotes;
    const stringifyNote = JSON.stringify(updatedNotes);
    fs.writeFile("./db/db.json", stringifyNote, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("note successfully deleted from db.json");
      }
    });
    res.json(stringifyNote);
  });
});

//function to update db
function updateDb() {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      consolg.error(err);
    } else {
      parsedNotes = JSON.parse(data);
      parsedNotes.push(newNote);

      fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (wirteErr) =>
        wirteErr
          ? console.error(writeErr)
          : console.info("Successfully updated notes!")
      );
    }
  });
}

//GET * should return index.html
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
