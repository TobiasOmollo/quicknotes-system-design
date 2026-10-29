const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const addNoteButton = document.querySelector("#add-note-btn");
const notesSection = document.querySelector("#notes");
const addNoteSection = document.querySelector("#add-note");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let activeRequests = 0;

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
    }

    return response;
}

function setStatus(message, state = "") {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
}

function showView(view) {
    const showNotes = view === "notes";
    notesSection.hidden = !showNotes;
    addNoteSection.hidden = showNotes;
    loadButton.setAttribute("aria-pressed", String(showNotes));
    addNoteButton.setAttribute("aria-pressed", String(!showNotes));
}

function updateButtons() {
    const disabled = activeRequests > 0;
    loadButton.disabled = disabled;
    addNoteButton.disabled = disabled;
    submitButton.disabled = disabled;
    notesList.querySelectorAll("button").forEach((button) => {
        button.disabled = disabled;
    });
}

function beginRequest(message) {
    activeRequests += 1;
    updateButtons();
    setStatus(message, "loading");
}

function finishRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    updateButtons();
}

function showEmptyState(message = "No notes found.") {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = message;
    notesList.replaceChildren(emptyItem);
}

function renderNote(note) {
    const item = document.createElement("li");
    item.dataset.noteId = String(note.id);

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.noteId = String(note.id);
    deleteButton.textContent = "Delete";

    item.append(title, body, deleteButton);
    return item;
}

function displayNotes(notes) {
    notesList.replaceChildren();

    if (notes.length === 0) {
        showEmptyState();
        return;
    }

    const noteElements = notes.map(renderNote);
    notesList.append(...noteElements);
}

async function loadNotes() {
    showView("notes");
    beginRequest("Loading notes...");

    try {
        const response = await request(`${API_URL}?_limit=10`);
        const notes = await response.json();

        if (!Array.isArray(notes)) {
            throw new Error("The server returned an invalid notes list.");
        }

        displayNotes(notes);
        setStatus(notes.length === 0 ? "No notes found." : `Loaded ${notes.length} notes.`, notes.length === 0 ? "empty" : "success");
    } catch (error) {
        showEmptyState("Notes could not be loaded.");
        setStatus(`Error loading notes: ${error.message}`, "error");
    } finally {
        finishRequest();
    }
}

async function createNote(title, body) {
    beginRequest("Saving note...");

    try {
        const response = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, body, userId: 1 }),
        });
        const note = await response.json();

        if (note.id === undefined || note.id === null) {
            throw new Error("The server did not return an ID for the new note.");
        }

        const placeholder = notesList.querySelector(".empty-state");
        if (placeholder) {
            placeholder.remove();
        }
        notesList.prepend(renderNote({ id: note.id, title: note.title, body: note.body }));
        setStatus("Note created successfully.", "success");
        noteForm.reset();
    } catch (error) {
        setStatus(`Error creating note: ${error.message}`, "error");
    } finally {
        finishRequest();
    }
}

async function deleteNote(noteId, item) {
    beginRequest("Deleting note...");

    try {
        await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
            method: "DELETE",
        });

        item.remove();
        if (notesList.children.length === 0) {
            showEmptyState();
            setStatus("Note deleted. No notes remain.", "empty");
        } else {
            setStatus("Note deleted successfully.", "success");
        }
    } catch (error) {
        setStatus(`Error deleting note: ${error.message}`, "error");
    } finally {
        finishRequest();
    }
}

loadButton.addEventListener("click", loadNotes);
addNoteButton.addEventListener("click", () => {
    showView("add-note");
    setStatus("", "");
});

noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
        setStatus("Please enter a title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        setStatus("The title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    createNote(title, bodyInput.value.trim());
});

notesList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const button = event.target.closest('button[data-action="delete"]');
    const item = button?.closest("li[data-note-id]");
    if (!button || !item) {
        return;
    }

    deleteNote(button.dataset.noteId, item);
});

showEmptyState("Load saved notes to see them here.");