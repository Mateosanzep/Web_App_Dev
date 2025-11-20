import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Note from "./components/Note";
import CreateArea from "./components/CreateArea";
import "./prototype/styles.css";

function App() {
  const [notes, setNotes] = useState([]);

  function addNote(newNote) {
    setNotes(prevNotes => {
      const id = Date.now();
      return [...prevNotes, { id, ...newNote }];
    });
  }

  function deleteNote(id) {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map(note => (
        <Note key={note.id} id={note.id} title={note.title} content={note.content} onDelete={deleteNote} />
      ))}
      <Footer />
    </div>
  );
}

export default App;
