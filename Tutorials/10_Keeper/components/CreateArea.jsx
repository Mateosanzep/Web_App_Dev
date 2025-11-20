import React, { useState } from "react";

function CreateArea(props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "title") setTitle(value);
    if (name === "content") setContent(value);
  }

  function submitNote(event) {
    event.preventDefault();
    if (!title.trim() && !content.trim()) return;
    props.onAdd({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
  }

  return (
    <div>
      <form onSubmit={submitNote}>
        <input name="title" placeholder="Title" value={title} onChange={handleChange} />
        <textarea name="content" placeholder="Take a note..." rows="3" value={content} onChange={handleChange} />
        <button>Add</button>
      </form>
    </div>
  );
}

export default CreateArea;
