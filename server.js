// This is a simple Express server for the backend
// In a real application, you would integrate with Dialogflow API

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the root

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Serve index.html from the root
});

// Simulated Dialogflow API endpoint
app.post("/api/dialogflow", async (req, res) => {
  const { message } = req.body;

  // Create a new session
  const sessionId = uuid.v4();
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(
    "small-talk-ufll",
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "en",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ response: result.fulfillmentText });
  } catch (error) {
    console.error("Dialogflow API error:", error);
    res.status(500).json({ error: "Failed to process your request" });
  }
});

// Task management endpoints
app.get("/api/tasks", (req, res) => {
  res.sendFile(path.join(__dirname, "db/tasks.json"));
});

app.post("/api/tasks", (req, res) => {
  const fs = require("fs");
  const tasksPath = path.join(__dirname, "db/tasks.json");

  // Read existing tasks
  let tasks = [];
  try {
    if (fs.existsSync(tasksPath)) {
      const tasksData = fs.readFileSync(tasksPath);
      tasks = JSON.parse(tasksData);
    }
  } catch (error) {
    console.error("Error reading tasks:", error);
  }

  // Add new task
  const newTask = req.body;
  tasks.push(newTask);

  // Write updated tasks
  try {
    // Ensure directory exists
    const dir = path.join(__dirname, "db");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
    res.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({ success: false, error: "Failed to save task" });
  }
});

// Note management endpoints
app.get("/api/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "db/notes.json"));
});

app.post("/api/notes", (req, res) => {
  const fs = require("fs");
  const notesPath = path.join(__dirname, "db/notes.json");

  // Read existing notes
  let notes = {};
  try {
    if (fs.existsSync(notesPath)) {
      const notesData = fs.readFileSync(notesPath);
      notes = JSON.parse(notesData);
    }
  } catch (error) {
    console.error("Error reading notes:", error);
  }

  // Add new note
  const { title, content } = req.body;
  notes[title] = {
    content,
    createdAt: new Date().toISOString(),
  };

  // Write updated notes
  try {
    // Ensure directory exists
    const dir = path.join(__dirname, "db");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
    res.json({ success: true, note: { title, content } });
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ success: false, error: "Failed to save note" });
  }
});

// ... Existing imports and setup ...

app.post("/api/dialogflow", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  const queryText = req.body.queryResult.queryText;

  if (intent === "Capital") {
    const country = parameters.country;
    const capitals = { Kenya: "Nairobi", Uganda: "Kampala", France: "Paris" };
    res.json({
      fulfillmentText: `The capital of ${country} is ${
        capitals[country] || "unknown"
      }!`,
    });
  } else if (queryText.toLowerCase().includes("summarize")) {
    const text = queryText.replace(/summarize/i, "").trim();
    const summary =
      text
        .match(/[^.!?]+[.!?]+/g)
        ?.slice(0, 2)
        .join(" ") || text;
    res.json({ fulfillmentText: `Summary: ${summary}` });
  } else {
    res.json({ fulfillmentText: "Processing... How can FRIDAY assist?" });
  }
});

// ... Existing server start ...

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Instructions for running the server:
// 1. Install dependencies: npm install express cors
// 2. Run the server: node server.js
// 3. Open http://localhost:3000 in your browser
