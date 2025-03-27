// DOM Elements
const chatMessages = document.getElementById("chat-messages")
const userInput = document.getElementById("user-input")
const sendButton = document.getElementById("send-button")
const themeToggle = document.getElementById("theme-toggle")
const helpButton = document.getElementById("help-button")
const clearChatButton = document.getElementById("clear-chat-button")
const helpModal = document.getElementById("help-modal")
const closeButtons = document.querySelectorAll(".close-button")
const currentYear = document.getElementById("current-year")

// State
let darkMode = false
let isWaitingForResponse = false
let messages = []
let tasks = []
let notes = {}
const typewriterSpeed = 10 // ms per character

// Initialize the app
function init() {
  // Set current year in footer
  currentYear.textContent = new Date().getFullYear()

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("fridayLiteTheme")
  if (savedTheme === "dark") {
    enableDarkMode()
  }

  // Load tasks from localStorage
  loadTasks()

  // Load notes from localStorage
  loadNotes()

  // Add welcome message
  addMessage({
    id: "welcome",
    text: "# 👋 Hello!\n\nI'm FRIDAY LITE, your personal assistant. I can help with:\n\n- **Task management** (reminders, to-dos)\n- **Note taking** and summarization\n- **Study assistance** (generate quizzes, summarize content)\n- **Productivity tips**\n\nHow can I assist you today?",
    sender: "assistant",
    timestamp: new Date(),
  })

  // Load chat history from localStorage if available
  loadChatHistory()

  // Check for due tasks
  checkDueTasks()

  // Add event listeners
  setupEventListeners()
}

// Set up event listeners
function setupEventListeners() {
  // Send message on button click
  sendButton.addEventListener("click", handleSendMessage)

  // Send message on Enter key
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  })

  // Toggle theme
  themeToggle.addEventListener("click", toggleTheme)

  // Open help modal
  helpButton.addEventListener("click", () => {
    helpModal.classList.add("active")
  })

  // Clear chat
  clearChatButton.addEventListener("click", clearChat)

  // Close modals
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal")
      if (modal) {
        modal.classList.remove("active")
      }
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active")
    }
  })

  // Input validation
  userInput.addEventListener("input", () => {
    sendButton.disabled = !userInput.value.trim() || isWaitingForResponse
  })

  // Add scroll event listener to maintain position when user scrolls up
  let isUserScrolling = false
  let isNearBottom = true

  chatMessages.addEventListener("scroll", () => {
    // Check if user is near bottom
    isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 50

    // If user scrolls up, mark as user scrolling
    if (!isNearBottom) {
      isUserScrolling = true
    } else {
      isUserScrolling = false
    }
  })

  // Override scrollToBottom to respect user scrolling
  window.originalScrollToBottom = scrollToBottom
  window.scrollToBottom = () => {
    if (!isUserScrolling || isNearBottom) {
      window.originalScrollToBottom()
    }
  }
}

// Handle sending a message
function handleSendMessage() {
  const text = userInput.value.trim()

  if (!text || isWaitingForResponse) return

  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    text: text,
    sender: "user",
    timestamp: new Date(),
  }

  addMessage(userMessage)
  messages.push(userMessage)

  // Clear input
  userInput.value = ""
  sendButton.disabled = true

  // Show typing indicator
  showTypingIndicator()

  // Process the message and get a response
  processUserMessage(text)

  // Save chat history
  saveChatHistory()
}

// Process user message and determine intent
function processUserMessage(text) {
  // Convert to lowercase for easier matching
  const input = text.toLowerCase()

  // Check for task-related intents
  if (
    input.includes("remind me to") ||
    input.includes("add task") ||
    (input.includes("create") && input.includes("task"))
  ) {
    handleTaskCreation(text)
    return
  }

  // Check for task listing intent
  if (
    (input.includes("show") && input.includes("task")) ||
    (input.includes("list") && input.includes("task")) ||
    input.includes("my tasks")
  ) {
    listTasks()
    return
  }

  // Check for task completion intent
  if ((input.includes("complete") || input.includes("mark") || input.includes("finish")) && input.includes("task")) {
    handleTaskCompletion(text)
    return
  }

  // Check for note-taking intent
  if ((input.includes("save") || input.includes("store") || input.includes("take")) && input.includes("note")) {
    handleNoteTaking(text)
    return
  }

  // Check for note retrieval intent
  if ((input.includes("show") || input.includes("get") || input.includes("retrieve")) && input.includes("note")) {
    handleNoteRetrieval(text)
    return
  }

  // Check for summarization intent
  if (input.includes("summarize") || (input.includes("summary") && input.includes("of"))) {
    handleSummarization(text)
    return
  }

  // Check for quiz generation intent
  if (
    input.includes("quiz") ||
    input.includes("test me") ||
    (input.includes("generate") && input.includes("questions"))
  ) {
    handleQuizGeneration(text)
    return
  }

  // Check for productivity tips intent
  if (
    (input.includes("productivity") && (input.includes("tip") || input.includes("advice"))) ||
    input.includes("be more productive")
  ) {
    provideProductivityTip()
    return
  }

  // If no specific intent is matched, get a general response
  getDialogflowResponse(text)
}

// Handle task creation
function handleTaskCreation(text) {
  // Extract task description
  let taskDescription = ""
  let dueDate = null

  if (text.toLowerCase().includes("remind me to")) {
    taskDescription = text.split("remind me to")[1].trim()
  } else if (text.toLowerCase().includes("add task")) {
    taskDescription = text.split("add task")[1].trim()
  } else if (text.toLowerCase().includes("create") && text.toLowerCase().includes("task")) {
    taskDescription = text.replace(/create|task/gi, "").trim()
  }

  // Check for due date in the text
  const datePatterns = [
    {
      regex: /by\s(tomorrow)/i,
      handler: () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        return tomorrow
      },
    },
    {
      regex: /by\s(today)/i,
      handler: () => {
        const today = new Date()
        today.setHours(18, 0, 0, 0)
        return today
      },
    },
    {
      regex: /at\s(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
      handler: (match) => {
        return parseTimeString(match[1])
      },
    },
    {
      regex: /on\s(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      handler: (match) => {
        return getNextDayOfWeek(match[1])
      },
    },
    {
      regex:
        /on\s(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december))/i,
      handler: (match) => {
        return parseMonthDayString(match[1])
      },
    },
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex)
    if (match) {
      dueDate = pattern.handler(match)
      // Remove the date part from the task description
      taskDescription = taskDescription.replace(match[0], "").trim()
      break
    }
  }

  // Create a new task
  const newTask = {
    id: Date.now().toString(),
    description: taskDescription,
    completed: false,
    createdAt: new Date(),
    dueDate: dueDate,
  }

  // Add to tasks array
  tasks.push(newTask)

  // Save tasks to localStorage
  saveTasks()

  // Format due date for display
  let dueDateText = ""
  if (dueDate) {
    dueDateText = ` due on ${formatDate(dueDate)}`
  }

  // Respond to the user
  removeTypingIndicator()
  const response = `## ✅ Task Added\n\nI've added your task: "${taskDescription}"${dueDateText}.\n\nI'll remind you when it's due.`

  addAssistantMessage(response)
}

// Parse time string like "3pm" or "15:30"
function parseTimeString(timeStr) {
  const now = new Date()
  const timeRegex = /(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i
  const match = timeStr.match(timeRegex)

  if (match) {
    let hours = Number.parseInt(match[1])
    const minutes = match[2] ? Number.parseInt(match[2]) : 0
    const period = match[3] ? match[3].toLowerCase() : null

    // Adjust hours for 12-hour format
    if (period === "pm" && hours < 12) {
      hours += 12
    } else if (period === "am" && hours === 12) {
      hours = 0
    }

    now.setHours(hours, minutes, 0, 0)

    // If the time is already past for today, set it for tomorrow
    if (now < new Date()) {
      now.setDate(now.getDate() + 1)
    }

    return now
  }

  return null
}

// Get the next occurrence of a day of the week
function getNextDayOfWeek(dayName) {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const today = new Date()
  const targetDay = days.indexOf(dayName.toLowerCase())

  if (targetDay !== -1) {
    const daysUntilTarget = (targetDay + 7 - today.getDay()) % 7
    const nextOccurrence = new Date()
    nextOccurrence.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
    nextOccurrence.setHours(9, 0, 0, 0)
    return nextOccurrence
  }

  return null
}

// Parse month and day string like "25th of December"
function parseMonthDayString(dateStr) {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ]

  // Extract day and month
  const dayMatch = dateStr.match(/(\d{1,2})(?:st|nd|rd|th)?/)
  const monthMatch = dateStr.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  )

  if (dayMatch && monthMatch) {
    const day = Number.parseInt(dayMatch[1])
    const month = months.indexOf(monthMatch[1].toLowerCase())

    if (month !== -1 && day >= 1 && day <= 31) {
      const date = new Date()
      date.setMonth(month)
      date.setDate(day)
      date.setHours(9, 0, 0, 0)

      // If the date is already past for this year, set it for next year
      if (date < new Date()) {
        date.setFullYear(date.getFullYear() + 1)
      }

      return date
    }
  }

  return null
}

// List all tasks
function listTasks() {
  removeTypingIndicator()

  if (tasks.length === 0) {
    addAssistantMessage(
      "## 📋 Tasks\n\nYou don't have any tasks yet. You can create a task by saying something like 'Remind me to call mom tomorrow'.",
    )
    return
  }

  // Group tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  let response = "## 📋 Your Tasks\n\n"

  if (pendingTasks.length > 0) {
    response += "### 📝 Pending Tasks\n"
    pendingTasks.forEach((task, index) => {
      let taskInfo = `${index + 1}. ${task.description}`
      if (task.dueDate) {
        taskInfo += ` (Due: ${formatDate(new Date(task.dueDate))})`
      }
      response += taskInfo + "\n"
    })
  }

  if (completedTasks.length > 0) {
    response += "\n### ✅ Completed Tasks\n"
    completedTasks.forEach((task, index) => {
      response += `${index + 1}. ${task.description}\n`
    })
  }

  response +=
    "\nYou can mark a task as complete by saying 'Complete task [task number]' or 'Mark task [description] as done'."

  addAssistantMessage(response)
}

// Handle task completion
function handleTaskCompletion(text) {
  removeTypingIndicator()

  if (tasks.length === 0) {
    addAssistantMessage(
      "## 📋 Tasks\n\nYou don't have any tasks to complete yet. You can create a task by saying something like 'Remind me to call mom tomorrow'.",
    )
    return
  }

  // Check if user specified a task number
  const numberMatch = text.match(/task\s+(\d+)/i)
  if (numberMatch) {
    const taskIndex = Number.parseInt(numberMatch[1]) - 1
    const pendingTasks = tasks.filter((task) => !task.completed)

    if (taskIndex >= 0 && taskIndex < pendingTasks.length) {
      const task = pendingTasks[taskIndex]
      task.completed = true
      saveTasks()
      addAssistantMessage(`## ✅ Task Completed\n\nGreat job! I've marked "${task.description}" as complete.`)
      return
    } else {
      addAssistantMessage(
        `## ❓ Task Not Found\n\nI couldn't find task number ${taskIndex + 1}. Please try again or say "show my tasks" to see your task list.`,
      )
      return
    }
  }

  // Try to match by description
  const pendingTasks = tasks.filter((task) => !task.completed)
  const input = text.toLowerCase()

  for (const task of pendingTasks) {
    if (input.includes(task.description.toLowerCase())) {
      task.completed = true
      saveTasks()
      addAssistantMessage(`## ✅ Task Completed\n\nGreat job! I've marked "${task.description}" as complete.`)
      return
    }
  }

  // If no match found
  addAssistantMessage(
    "## ❓ Task Not Found\n\nI'm not sure which task you want to complete. Please say 'show my tasks' to see your task list, then specify the task number or description.",
  )
}

// Check for due tasks
function checkDueTasks() {
  const now = new Date()
  const pendingTasks = tasks.filter((task) => !task.completed && task.dueDate)

  const dueTasks = pendingTasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    // Task is due if it's within the next hour
    return dueDate <= new Date(now.getTime() + 60 * 60 * 1000)
  })

  if (dueTasks.length > 0) {
    let reminderText = "## ⏰ Task Reminder\n\nYou have the following tasks due soon:\n\n"
    dueTasks.forEach((task, index) => {
      reminderText += `${index + 1}. ${task.description} (Due: ${formatDate(new Date(task.dueDate))})\n`
    })

    addAssistantMessage(reminderText)
  }

  // Check again in 5 minutes
  setTimeout(checkDueTasks, 5 * 60 * 1000)
}

// Handle note taking
function handleNoteTaking(text) {
  removeTypingIndicator()

  // Try to extract the note title and content
  let noteTitle = ""
  let noteContent = ""

  if (text.toLowerCase().includes("titled")) {
    const parts = text.split(/titled\s+["']([^"']+)["']/i)
    if (parts.length >= 2) {
      noteTitle = parts[1].trim()
      noteContent = text.replace(/save|store|take|note|titled\s+["'][^"']+["']/gi, "").trim()
    }
  } else {
    // If no title specified, use the first few words as title
    noteContent = text.replace(/save|store|take|note/gi, "").trim()
    const words = noteContent.split(" ")
    noteTitle = words.slice(0, Math.min(5, words.length)).join(" ") + "..."
  }

  // Save the note
  notes[noteTitle] = {
    content: noteContent,
    createdAt: new Date().toISOString(),
  }

  // Save notes to localStorage
  saveNotes()

  addAssistantMessage(
    `## 📝 Note Saved\n\nI've saved your note titled "${noteTitle}".\n\nYou can retrieve it later by saying "show me my note about ${noteTitle.split(" ")[0]}".`,
  )
}

// Handle note retrieval
function handleNoteRetrieval(text) {
  removeTypingIndicator()

  if (Object.keys(notes).length === 0) {
    addAssistantMessage(
      "## 📝 Notes\n\nYou don't have any saved notes yet. You can create a note by saying something like 'Save a note titled \"Meeting Notes\" with the following content...'",
    )
    return
  }

  // Check if user wants to see all notes
  if (text.toLowerCase().includes("all notes") || text.toLowerCase().includes("list notes")) {
    listAllNotes()
    return
  }

  // Try to find the requested note
  const input = text.toLowerCase()
  let foundNote = null
  let foundTitle = ""

  for (const title in notes) {
    if (input.includes(title.toLowerCase())) {
      foundNote = notes[title]
      foundTitle = title
      break
    }
  }

  // If no exact match, try partial matching
  if (!foundNote) {
    for (const title in notes) {
      const words = title.toLowerCase().split(" ")
      for (const word of words) {
        if (word.length > 3 && input.includes(word)) {
          foundNote = notes[title]
          foundTitle = title
          break
        }
      }
      if (foundNote) break
    }
  }

  if (foundNote) {
    const createdDate = new Date(foundNote.createdAt)
    addAssistantMessage(
      `## 📝 Note: "${foundTitle}"\n\n*Created on ${formatDate(createdDate)}*\n\n${foundNote.content}`,
    )
  } else {
    addAssistantMessage(
      "## ❓ Note Not Found\n\nI couldn't find a note matching your description. Please say 'list all notes' to see your saved notes.",
    )
  }
}

// List all notes
function listAllNotes() {
  const notesList = Object.keys(notes)

  if (notesList.length === 0) {
    addAssistantMessage("## 📝 Notes\n\nYou don't have any saved notes yet.")
    return
  }

  let response = "## 📝 Your Notes\n\n"

  notesList.forEach((title, index) => {
    const createdDate = new Date(notes[title].createdAt)
    response += `${index + 1}. **${title}** (created on ${formatDate(createdDate)})\n`
  })

  response += "\nYou can retrieve a note by saying 'Show me my note about [title]'."

  addAssistantMessage(response)
}

// Handle text summarization
function handleSummarization(text) {
  removeTypingIndicator()

  // Extract the text to summarize
  let contentToSummarize = ""

  if (text.toLowerCase().includes("summarize this:")) {
    contentToSummarize = text.split("summarize this:")[1].trim()
  } else if (text.toLowerCase().includes("summary of:")) {
    contentToSummarize = text.split("summary of:")[1].trim()
  } else if (text.toLowerCase().includes("summarize")) {
    contentToSummarize = text.replace(/summarize/gi, "").trim()
  }

  if (contentToSummarize.length < 50) {
    addAssistantMessage(
      "## ❓ Text Too Short\n\nThe text you provided is too short to summarize. Please provide a longer text or lecture notes to summarize.",
    )
    return
  }

  // Perform improved summarization
  const summary = generateImprovedSummary(contentToSummarize)

  addAssistantMessage(`## 📚 Summary\n\n${summary}`)
}

// Generate an improved summary of text
function generateImprovedSummary(text) {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []

  if (sentences.length <= 3) {
    return text // Text is already short enough
  }

  // Calculate word frequency
  const wordFrequency = {}
  const words = text.toLowerCase().match(/\b\w+\b/g) || []

  // List of common words to ignore
  const commonWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "can",
    "could",
    "may",
    "might",
    "must",
    "shall",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "he",
    "him",
    "his",
    "she",
    "her",
    "hers",
    "we",
    "us",
    "our",
    "you",
    "your",
    "yours",
    "i",
    "me",
    "my",
    "mine",
  ]

  words.forEach((word) => {
    if (word.length > 2 && !commonWords.includes(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    }
  })

  // Find the most frequent words (keywords)
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((entry) => entry[0])

  // Score sentences based on keyword frequency and position
  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || []
    let score = 0

    // Score based on keywords
    sentenceWords.forEach((word) => {
      if (sortedWords.includes(word)) {
        score += 3 // Higher weight for keywords
      } else if (wordFrequency[word] && wordFrequency[word] > 1) {
        score += wordFrequency[word] / 2
      }
    })

    // Give higher scores to sentences at the beginning and end
    if (index === 0 || index === 1) {
      score *= 1.5 // First two sentences often contain key information
    } else if (index === sentences.length - 1 || index === sentences.length - 2) {
      score *= 1.25 // Last two sentences often contain conclusions
    }

    // Normalize by sentence length to avoid bias towards longer sentences
    // But also give some preference to medium-length sentences
    const length = sentenceWords.length
    if (length > 5 && length < 25) {
      score *= 1.2 // Prefer medium-length sentences
    } else if (length >= 25) {
      score *= 0.8 // Penalize very long sentences
    }

    return { sentence, score, index }
  })

  // Sort sentences by score
  sentenceScores.sort((a, b) => b.score - a.score)

  // Take top 30% of sentences or at least 3 sentences, but no more than 5
  const numSentences = Math.min(5, Math.max(3, Math.ceil(sentences.length * 0.3)))
  const topSentences = sentenceScores.slice(0, numSentences)

  // Sort back to original order
  topSentences.sort((a, b) => a.index - b.index)

  // Construct summary
  let summary = topSentences.map((item) => item.sentence.trim()).join(" ")

  // Add a conclusion if the summary doesn't include the last sentence and it seems important
  const lastSentence = sentences[sentences.length - 1]
  if (
    !summary.includes(lastSentence) &&
    sentenceScores.find((s) => s.sentence === lastSentence).score > sentenceScores[Math.floor(numSentences / 2)].score
  ) {
    summary += " " + lastSentence
  }

  return summary
}

// Handle quiz generation
function handleQuizGeneration(text) {
  removeTypingIndicator()

  // Extract the topic for the quiz
  let quizTopic = ""

  if (text.toLowerCase().includes("quiz on")) {
    quizTopic = text.split("quiz on")[1].trim()
  } else if (text.toLowerCase().includes("test me on")) {
    quizTopic = text.split("test me on")[1].trim()
  } else if (text.toLowerCase().includes("generate questions about")) {
    quizTopic = text.split("generate questions about")[1].trim()
  } else if (text.toLowerCase().includes("quiz")) {
    quizTopic = text.replace(/quiz|generate|questions|test me/gi, "").trim()
  }

  if (!quizTopic) {
    // Check if there's a note that can be used for quiz generation
    const notesList = Object.keys(notes)
    if (notesList.length > 0) {
      // Use the most recent note
      const latestNote = notesList.reduce((latest, current) => {
        return new Date(notes[current].createdAt) > new Date(notes[latest].createdAt) ? current : latest
      }, notesList[0])

      quizTopic = latestNote
      const quizContent = notes[latestNote].content

      const quiz = generateQuizFromContent(quizContent, latestNote)
      addAssistantMessage(`## 📚 Quiz: ${latestNote}\n\n${quiz}`)
    } else {
      addAssistantMessage(
        "## ❓ Topic Needed\n\nI need a topic to generate a quiz. Please specify a topic or save a note first that I can use to create questions.",
      )
    }
    return
  }

  // Generate a quiz on the specified topic
  const quiz = generateQuiz(quizTopic)

  addAssistantMessage(`## 📚 Quiz: ${quizTopic}\n\n${quiz}\n\nTo see the answers, just ask me "show quiz answers".`)
}

// Generate a quiz on a specific topic
function generateQuiz(topic) {
  // This is a simplified quiz generator
  // In a real app, you would use an AI API or a more sophisticated algorithm

  const quizTemplates = {
    history: [
      { question: "What year did World War II end?", answer: "1945" },
      { question: "Who was the first President of the United States?", answer: "George Washington" },
      { question: "Which empire was ruled by Genghis Khan?", answer: "Mongol Empire" },
      {
        question: "What was the name of the conflict between the North and South in the United States?",
        answer: "The Civil War",
      },
      {
        question: "Which country was the first to circumnavigate the globe?",
        answer: "Spain (expedition led by Ferdinand Magellan and completed by Juan Sebastián Elcano)",
      },
    ],
    science: [
      { question: "What is the chemical symbol for gold?", answer: "Au" },
      { question: "What is the closest planet to the Sun?", answer: "Mercury" },
      { question: "What is the hardest natural substance on Earth?", answer: "Diamond" },
      { question: "What is the process by which plants make their food called?", answer: "Photosynthesis" },
      { question: "What is the unit of electrical resistance?", answer: "Ohm" },
    ],
    math: [
      { question: "What is the value of π (pi) to two decimal places?", answer: "3.14" },
      { question: "What is the Pythagorean theorem?", answer: "a² + b² = c²" },
      { question: "What is the square root of 144?", answer: "12" },
      { question: "What is the formula for the area of a circle?", answer: "A = πr²" },
      { question: "What is the sum of angles in a triangle?", answer: "180 degrees" },
    ],
    literature: [
      { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
      { question: "What is the name of the main character in 'The Great Gatsby'?", answer: "Jay Gatsby" },
      { question: "Who wrote '1984'?", answer: "George Orwell" },
      {
        question: "What is the first book in J.K. Rowling's series?",
        answer: "Harry Potter and the Philosopher's Stone (or Sorcerer's Stone in the US)",
      },
      { question: "Who is the author of 'To Kill a Mockingbird'?", answer: "Harper Lee" },
    ],
    geography: [
      { question: "What is the largest ocean on Earth?", answer: "Pacific Ocean" },
      { question: "What is the capital of Japan?", answer: "Tokyo" },
      {
        question: "Which river is the longest in the world?",
        answer: "Nile River (although some sources say the Amazon River)",
      },
      {
        question: "What is the largest desert in the world?",
        answer: "Antarctic Desert (if considering only hot deserts, then the Sahara)",
      },
      {
        question: "Which country has the largest population?",
        answer: "China (although India is very close and may have surpassed it recently)",
      },
    ],
    "computer science": [
      { question: "What does CPU stand for?", answer: "Central Processing Unit" },
      { question: "What programming language is known for its use in web browsers?", answer: "JavaScript" },
      { question: "What does HTML stand for?", answer: "HyperText Markup Language" },
      { question: "What is the binary code for the letter 'A' in ASCII?", answer: "01000001" },
      {
        question: "What is the primary function of an operating system?",
        answer: "To manage hardware resources and provide services for computer programs",
      },
    ],
    productivity: [
      {
        question: "What is the Pomodoro Technique?",
        answer: "A time management method using 25-minute work intervals separated by short breaks",
      },
      { question: "What does GTD stand for in productivity systems?", answer: "Getting Things Done" },
      {
        question: "What is the 2-minute rule in productivity?",
        answer: "If a task takes less than 2 minutes, do it immediately rather than scheduling it for later",
      },
      {
        question: "What is the Eisenhower Matrix used for?",
        answer: "Prioritizing tasks based on urgency and importance",
      },
      {
        question: "What is the concept of 'deep work'?",
        answer: "The ability to focus without distraction on a cognitively demanding task",
      },
    ],
  }

  // Find the best matching category
  let bestCategory = "general"
  let highestMatch = 0

  for (const category in quizTemplates) {
    if (topic.toLowerCase().includes(category)) {
      if (category.length > highestMatch) {
        highestMatch = category.length
        bestCategory = category
      }
    }
  }

  // If no category matches, use a mix of questions
  let questions = []
  if (bestCategory === "general") {
    // Take one question from each category
    for (const category in quizTemplates) {
      const randomIndex = Math.floor(Math.random() * quizTemplates[category].length)
      questions.push(quizTemplates[category][randomIndex])
    }
    // Shuffle and take 5 questions
    questions = shuffleArray(questions).slice(0, 5)
  } else {
    questions = quizTemplates[bestCategory]
  }

  // Format the quiz
  let quiz = ""
  questions.forEach((q, index) => {
    quiz += `${index + 1}. ${q.question}\n`
  })

  // Store the answers for later
  localStorage.setItem("fridayLiteQuizAnswers", JSON.stringify(questions))

  return quiz
}

// Generate a quiz from note content
function generateQuizFromContent(content, topic) {
  // Extract key sentences and concepts from the content
  const sentences = content.match(/[^.!?]+[.!?]+/g) || []

  if (sentences.length < 3) {
    return "The content is too short to generate a meaningful quiz. Please provide more detailed notes."
  }

  // Find important sentences (those with keywords or that appear to contain facts)
  const importantSentences = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase()
    // Look for sentences that likely contain facts or key concepts
    return (
      lower.includes("is") ||
      lower.includes("are") ||
      lower.includes("was") ||
      lower.includes("were") ||
      lower.includes("defined as") ||
      lower.includes("means") ||
      lower.includes("refers to") ||
      /\d+/.test(lower) // Contains numbers
    )
  })

  // Generate questions from important sentences
  const questions = []

  importantSentences.forEach((sentence) => {
    const question = generateQuestionFromSentence(sentence)
    if (question) {
      questions.push(question)
    }

    // Limit to 5 questions
    if (questions.length >= 5) {
      return
    }
  })

  // If we couldn't generate enough questions, add some generic ones
  if (questions.length < 3) {
    questions.push(
      { question: `What is the main topic of "${topic}"?`, answer: "Refer to your notes for the answer." },
      { question: `List three key points from "${topic}".`, answer: "Refer to your notes for the answer." },
      {
        question: `How would you summarize "${topic}" in one sentence?`,
        answer: "Refer to your notes for the answer.",
      },
    )
  }

  // Format the quiz
  let quiz = ""
  questions.forEach((q, index) => {
    quiz += `${index + 1}. ${q.question}\n`
  })

  // Store the answers for later
  localStorage.setItem("fridayLiteQuizAnswers", JSON.stringify(questions))

  return quiz
}

// Generate a question from a sentence
function generateQuestionFromSentence(sentence) {
  const sentence_lower = sentence.toLowerCase().trim()

  // Skip sentences that are too short
  if (sentence.split(" ").length < 5) {
    return null
  }

  // Different question templates based on sentence structure
  if (sentence_lower.includes(" is ")) {
    const parts = sentence.split(" is ")
    if (parts.length >= 2 && parts[0].length > 0) {
      return {
        question: `What is ${parts[0].trim()}?`,
        answer: `${parts[0]} is ${parts.slice(1).join(" is ")}`,
      }
    }
  } else if (sentence_lower.includes(" are ")) {
    const parts = sentence.split(" are ")
    if (parts.length >= 2 && parts[0].length > 0) {
      return {
        question: `What are ${parts[0].trim()}?`,
        answer: `${parts[0]} are ${parts.slice(1).join(" are ")}`,
      }
    }
  } else if (sentence_lower.includes(" was ")) {
    const parts = sentence.split(" was ")
    if (parts.length >= 2 && parts[0].length > 0) {
      return {
        question: `What was ${parts[0].trim()}?`,
        answer: `${parts[0]} was ${parts.slice(1).join(" was ")}`,
      }
    }
  } else if (sentence_lower.includes(" means ") || sentence_lower.includes(" refers to ")) {
    const separator = sentence_lower.includes(" means ") ? " means " : " refers to "
    const parts = sentence.split(separator)
    if (parts.length >= 2 && parts[0].length > 0) {
      return {
        question: `What does ${parts[0].trim()} mean?`,
        answer: sentence,
      }
    }
  } else if (/\d+/.test(sentence_lower)) {
    // If the sentence contains numbers, it might be a fact with a date or statistic
    return {
      question: `What fact is associated with the numbers in this statement: "${sentence.trim()}"?`,
      answer: sentence,
    }
  }

  // If no specific pattern matches, create a general question
  return {
    question: `Explain this concept: "${sentence.trim()}"`,
    answer: sentence,
  }
}

// Provide a productivity tip
function provideProductivityTip() {
  removeTypingIndicator()

  const productivityTips = [
    "Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.",
    "Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately rather than scheduling it for later.",
    "Plan your day the night before. Identify your 3 most important tasks to accomplish.",
    "Use the Eisenhower Matrix to prioritize tasks: Urgent & Important (Do first), Important but Not Urgent (Schedule), Urgent but Not Important (Delegate), Neither Urgent nor Important (Eliminate).",
    "Practice 'time blocking' by scheduling specific blocks of time for different types of work or activities.",
    "Minimize multitasking. Focus on one task at a time for better quality and efficiency.",
    "Take regular breaks to maintain energy and focus. Try the 52/17 rule: 52 minutes of work followed by 17 minutes of rest.",
    "Use the 'eat the frog' technique: Do your most difficult or important task first thing in the morning.",
    "Batch similar tasks together to reduce context switching and improve efficiency.",
    "Set specific, measurable, achievable, relevant, and time-bound (SMART) goals for your work.",
    "Use the 'touch it once' principle: When you pick up a task, complete it, delegate it, or schedule it immediately.",
    "Practice the 80/20 rule (Pareto Principle): Focus on the 20% of activities that produce 80% of your results.",
    "Create a distraction-free environment by silencing notifications and using website blockers during focused work periods.",
    "Use the 'Swiss cheese' method for large tasks: Poke holes in big projects by completing small, manageable chunks whenever you have time.",
    "End each workday with a shutdown ritual: Review what you accomplished, update your to-do list, and prepare for tomorrow.",
  ]

  const randomTip = productivityTips[Math.floor(Math.random() * productivityTips.length)]

  addAssistantMessage(
    `## ⚡ Productivity Tip\n\n${randomTip}\n\nWould you like another tip or more information about this technique?`,
  )
}

// Add a message to the chat
function addMessage(message) {
  const messageElement = document.createElement("div")
  messageElement.classList.add("message", message.sender)

  const formattedTime = formatTime(message.timestamp)

  const avatarIcon = message.sender === "assistant" ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'

  // For user messages, format the text immediately
  // For assistant messages, create an empty typewriter div that will be filled later
  const messageTextContent =
    message.sender === "assistant" ? '<div class="typewriter"></div>' : formatMessageText(message.text)

  messageElement.innerHTML = `
    <div class="message-content">
      <div class="avatar">${avatarIcon}</div>
      <div class="bubble">
        <div class="message-text">${messageTextContent}</div>
        <div class="timestamp">${formattedTime}</div>
      </div>
    </div>
  `

  chatMessages.appendChild(messageElement)

  // If it's an assistant message, apply typewriter effect
  if (message.sender === "assistant") {
    const typewriterElement = messageElement.querySelector(".typewriter")
    applyTypewriterEffect(typewriterElement, message.text)
  }

  // Scroll to bottom
  scrollToBottom()
}

// Apply typewriter effect to text
function applyTypewriterEffect(element, text) {
  // First format the text to HTML
  const formattedText = formatMessageText(text)

  // Create a temporary div to hold the HTML content
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = formattedText

  // Clear the typewriter element
  element.innerHTML = ""

  // Get all nodes from the temporary div
  const nodes = Array.from(tempDiv.childNodes)

  // Set up the typewriter effect
  let currentNodeIndex = 0
  let currentTextIndex = 0
  const speed = typewriterSpeed

  function typeNextChunk() {
    if (currentNodeIndex >= nodes.length) {
      return // Done typing
    }

    const currentNode = nodes[currentNodeIndex]

    // If it's a text node, type it character by character
    if (currentNode.nodeType === Node.TEXT_NODE) {
      if (currentTextIndex < currentNode.textContent.length) {
        const chunkSize = 5 // Process multiple characters at once for smoother effect
        const endIndex = Math.min(currentTextIndex + chunkSize, currentNode.textContent.length)
        const textChunk = currentNode.textContent.substring(currentTextIndex, endIndex)

        // If this is the first chunk of this text node, create a new text node
        if (currentTextIndex === 0) {
          element.appendChild(document.createTextNode(textChunk))
        } else {
          // Otherwise append to the last child (which should be our text node)
          const lastChild = element.lastChild
          if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
            lastChild.textContent += textChunk
          } else {
            element.appendChild(document.createTextNode(textChunk))
          }
        }

        currentTextIndex += chunkSize
        scrollToBottom()
        setTimeout(typeNextChunk, speed)
      } else {
        // Move to next node
        currentNodeIndex++
        currentTextIndex = 0
        setTimeout(typeNextChunk, speed)
      }
    }
    // If it's an element node, add it all at once
    else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      element.appendChild(currentNode.cloneNode(true))
      currentNodeIndex++
      setTimeout(typeNextChunk, speed)
    }
    // Skip other node types
    else {
      currentNodeIndex++
      setTimeout(typeNextChunk, 0)
    }
  }

  // Start the typing effect
  typeNextChunk()
}

// Improve the formatMessageText function to handle markdown better
function formatMessageText(text) {
  // First handle headers (must be done before newlines are converted)
  let formatted = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>")
  formatted = formatted.replace(/^## (.*?)$/gm, "<h2>$1</h2>")
  formatted = formatted.replace(/^### (.*?)$/gm, "<h3>$1</h3>")

  // Replace newlines with <br>
  formatted = formatted.replace(/\n/g, "<br>")

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Lists (must be done after newlines are converted)
  formatted = formatted.replace(/- (.*?)(<br>|$)/g, "• $1<br>")

  // Code
  formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>")

  return formatted
}

// Add an assistant message (helper function)
function addAssistantMessage(text) {
  const assistantMessage = {
    id: Date.now().toString(),
    text: text,
    sender: "assistant",
    timestamp: new Date(),
  }

  addMessage(assistantMessage)
  messages.push(assistantMessage)

  // Save chat history
  saveChatHistory()
}

// Show typing indicator
function showTypingIndicator() {
  isWaitingForResponse = true

  const typingElement = document.createElement("div")
  typingElement.classList.add("message", "assistant", "typing-indicator-container")
  typingElement.id = "typing-indicator"

  typingElement.innerHTML = `
    <div class="message-content">
      <div class="avatar"><i class="fas fa-robot"></i></div>
      <div class="bubble typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `

  chatMessages.appendChild(typingElement)
  scrollToBottom()
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator")
  if (typingIndicator) {
    typingIndicator.remove()
  }
  isWaitingForResponse = false
}

// Simulate Dialogflow response for general queries
function getDialogflowResponse(userInput) {
  // Simulate network delay
  setTimeout(
    () => {
      removeTypingIndicator()

      const input = userInput.toLowerCase()
      let response = ""

      if (input.includes("hello") || input.includes("hi")) {
        response =
          "## 👋 Hello!\n\nHello there! How can I assist you today? I can help with tasks, notes, summarization, quizzes, or productivity tips."
      } else if (input.includes("how are you")) {
        response =
          "## 😊 I'm Great!\n\nI'm functioning perfectly! Thanks for asking. How about you? Is there anything I can help you with today?"
      } else if (input.includes("weather")) {
        response =
          "## 🌤️ Weather\n\nI'm not connected to a weather service yet, but I'd be happy to help with tasks, notes, or productivity tips!"
      } else if (input.includes("name")) {
        response =
          "## 🤖 About Me\n\nI'm FRIDAY LITE, your personal AI assistant. Named after Tony Stark's AI, but a bit more lightweight! I can help you manage tasks, take notes, generate quizzes, and provide productivity tips."
      } else if (input.includes("thank")) {
        response =
          "## 😊 You're Welcome!\n\nYou're welcome! I'm happy to help. Is there anything else you need assistance with?"
      } else if (input.includes("bye") || input.includes("goodbye")) {
        response =
          "## 👋 Goodbye\n\nGoodbye! Feel free to chat again whenever you need assistance with your tasks or studies."
      } else if (input.includes("time")) {
        response = `## ⏰ Current Time\n\nThe current time is ${new Date().toLocaleTimeString()}.`
      } else if (input.includes("date")) {
        response = `## 📅 Today's Date\n\nToday is ${new Date().toLocaleDateString()}.`
      } else if (input.includes("joke")) {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Why did the scarecrow win an award? Because he was outstanding in his field!",
          "What do you call a fake noodle? An impasta!",
          "How does a computer get drunk? It takes screenshots!",
          "Why couldn't the bicycle stand up by itself? It was two tired!",
        ]
        response = `## 😂 Here's a Joke\n\n${jokes[Math.floor(Math.random() * jokes.length)]}`
      } else if (input.includes("quiz answers") || input.includes("show answers")) {
        showQuizAnswers()
        return
      } else if (input.includes("help") || input.includes("what can you do")) {
        response =
          `## 🌟 FRIDAY LITE Capabilities\n\nI can help you with several things:\n\n` +
          `### 📋 **Task Management**\n` +
          `- "Remind me to call mom tomorrow at 5pm"\n` +
          `- "Show my tasks"\n` +
          `- "Mark task 2 as complete"\n\n` +
          `### 📝 **Notes**\n` +
          `- "Take a note titled 'Meeting Notes' with the following content..."\n` +
          `- "Show me my notes"\n` +
          `- "Show me my note about meeting"\n\n` +
          `### 📚 **Study Assistance**\n` +
          `- "Summarize this: [paste text]"\n` +
          `- "Generate a quiz on history"\n` +
          `- "Create a quiz from my latest note"\n\n` +
          `### ⚡ **Productivity**\n` +
          `- "Give me a productivity tip"\n\n` +
          `Just let me know what you need help with!`
      } else {
        response =
          "## 🤔 I'm Not Sure\n\nI understand you're trying to communicate with me, but I'm not sure how to help with that specific request. I can assist with task management, note-taking, summarization, quiz generation, and productivity tips. Try asking something like \"What can you do?\" for more information."
      }

      addAssistantMessage(response)

      // Enable send button if input has text
      sendButton.disabled = !userInput.value.trim()
    },
    1000 + Math.random() * 1000,
  ) // Random delay between 1-2 seconds
}

// Show quiz answers
function showQuizAnswers() {
  const savedAnswers = localStorage.getItem("fridayLiteQuizAnswers")

  if (!savedAnswers) {
    addAssistantMessage(
      "## ❓ No Quiz Found\n\nI don't have any recent quiz answers saved. Please generate a quiz first.",
    )
    return
  }

  const questions = JSON.parse(savedAnswers)

  let response = "## 📝 Quiz Answers\n\n"

  questions.forEach((q, index) => {
    response += `**${index + 1}. ${q.question}**\n   Answer: ${q.answer}\n\n`
  })

  addAssistantMessage(response)
}

// Format time for display
function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Format date for display
function formatDate(date) {
  const now = new Date()
  const dateObj = new Date(date)

  // If it's today
  if (dateObj.toDateString() === now.toDateString()) {
    return `Today at ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  // If it's tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (dateObj.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }

  // Otherwise, show full date
  return dateObj.toLocaleDateString() + " at " + dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Enhance scrollToBottom to ensure it works properly
function scrollToBottom() {
  // Use requestAnimationFrame to ensure the DOM has updated
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight
  })
}

// Toggle dark/light theme
function toggleTheme() {
  if (darkMode) {
    disableDarkMode()
  } else {
    enableDarkMode()
  }
}

// Enable dark mode
function enableDarkMode() {
  document.body.classList.add("dark-theme")
  themeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="tooltip">Light Mode</span>'
  darkMode = true
  localStorage.setItem("fridayLiteTheme", "dark")
}

// Disable dark mode
function disableDarkMode() {
  document.body.classList.remove("dark-theme")
  themeToggle.innerHTML = '<i class="fas fa-moon"></i><span class="tooltip">Dark Mode</span>'
  darkMode = false
  localStorage.setItem("fridayLiteTheme", "light")
}

// Clear chat
function clearChat() {
  // Keep only the welcome message
  const welcomeMessage = messages.find((msg) => msg.id === "welcome")

  // Clear chat messages from DOM
  chatMessages.innerHTML = ""

  // Reset messages array
  messages = welcomeMessage ? [welcomeMessage] : []

  // Add welcome message back to DOM if it exists
  if (welcomeMessage) {
    addMessage(welcomeMessage)
  } else {
    // Add a new welcome message if none exists
    addMessage({
      id: "welcome",
      text: "# 👋 Hello!\n\nI'm FRIDAY LITE, your personal assistant. I can help with:\n\n- **Task management** (reminders, to-dos)\n- **Note taking** and summarization\n- **Study assistance** (generate quizzes, summarize content)\n- **Productivity tips**\n\nHow can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    })
  }

  // Save chat history
  saveChatHistory()
}

// Save chat history to localStorage
function saveChatHistory() {
  try {
    localStorage.setItem("fridayLiteMessages", JSON.stringify(messages))
  } catch (error) {
    console.error("Error saving chat history:", error)
  }
}

// Load chat history from localStorage
function loadChatHistory() {
  try {
    const savedMessages = localStorage.getItem("fridayLiteMessages")
    if (savedMessages) {
      // Parse saved messages but skip rendering the welcome message again
      const parsedMessages = JSON.parse(savedMessages)

      // Filter out the welcome message if it exists in saved messages
      const messagesToRender = parsedMessages.filter((msg) => msg.id !== "welcome")

      // Add messages to the chat
      messagesToRender.forEach((message) => {
        // Convert string timestamp back to Date object
        message.timestamp = new Date(message.timestamp)
        addMessage(message)
      })

      // Update messages array
      messages = parsedMessages
    }
  } catch (error) {
    console.error("Error loading chat history:", error)
  }
}

// Save tasks to localStorage
function saveTasks() {
  try {
    localStorage.setItem("fridayLiteTasks", JSON.stringify(tasks))
  } catch (error) {
    console.error("Error saving tasks:", error)
  }
}

// Load tasks from localStorage
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("fridayLiteTasks")
    if (savedTasks) {
      tasks = JSON.parse(savedTasks)

      // Convert string dates back to Date objects
      tasks.forEach((task) => {
        if (task.dueDate) {
          task.dueDate = new Date(task.dueDate)
        }
        task.createdAt = new Date(task.createdAt)
      })
    }
  } catch (error) {
    console.error("Error loading tasks:", error)
  }
}

// Save notes to localStorage
function saveNotes() {
  try {
    localStorage.setItem("fridayLiteNotes", JSON.stringify(notes))
  } catch (error) {
    console.error("Error saving notes:", error)
  }
}

// Load notes from localStorage
function loadNotes() {
  try {
    const savedNotes = localStorage.getItem("fridayLiteNotes")
    if (savedNotes) {
      notes = JSON.parse(savedNotes)
    }
  } catch (error) {
    console.error("Error loading notes:", error)
  }
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Initialize the app
init()

