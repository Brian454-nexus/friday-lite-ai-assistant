"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Moon, Sun, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function FridayLite() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm FRIDAY LITE, your personal assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("fridayLiteTheme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("fridayLiteTheme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("fridayLiteTheme", "light")
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // In a real app, this would be a call to your Dialogflow API
      // For now, we'll simulate a response
      const response = await simulateDialogflowResponse(input)

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting response:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // This function simulates a response from Dialogflow
  // In a real app, this would be replaced with an actual API call
  const simulateDialogflowResponse = async (userInput: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello there! How can I assist you today?"
    } else if (input.includes("how are you")) {
      return "I'm functioning perfectly! Thanks for asking. How about you?"
    } else if (input.includes("weather")) {
      return "I'm not connected to a weather service yet, but I'd be happy to help with something else!"
    } else if (input.includes("name")) {
      return "I'm FRIDAY LITE, your personal AI assistant. Named after Tony Stark's AI, but a bit more lightweight!"
    } else if (input.includes("thank")) {
      return "You're welcome! I'm happy to help."
    } else if (input.includes("bye") || input.includes("goodbye")) {
      return "Goodbye! Feel free to chat again whenever you need assistance."
    } else if (input.includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`
    } else if (input.includes("date")) {
      return `Today is ${new Date().toLocaleDateString()}.`
    } else if (input.includes("joke")) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a fake noodle? An impasta!",
        "How does a computer get drunk? It takes screenshots!",
        "Why couldn't the bicycle stand up by itself? It was two tired!",
      ]
      return jokes[Math.floor(Math.random() * jokes.length)]
    } else {
      return "I understand your message, but I'm still learning. In a full implementation, I would connect to Dialogflow for more intelligent responses!"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950",
        darkMode ? "dark" : "",
      )}
    >
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">FRIDAY LITE</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 py-3">
            <CardTitle className="text-center text-gray-700 dark:text-gray-200">Chat with FRIDAY LITE</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div className="flex items-end space-x-2">
                    {message.sender === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-md px-4 py-2 rounded-t-lg",
                        message.sender === "user"
                          ? "bg-indigo-600 text-white rounded-bl-lg"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-br-lg",
                      )}
                    >
                      <p>{message.text}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          message.sender === "user" ? "text-indigo-200" : "text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-t-lg rounded-br-lg">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        FRIDAY LITE - AI Personal Assistant &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

