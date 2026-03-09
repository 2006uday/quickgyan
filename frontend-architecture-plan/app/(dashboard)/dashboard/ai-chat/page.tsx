"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Brain,
  Send,
  Trash2,
  Sparkles,
  User,
  Loader2,
  Lightbulb,
  BookOpen,
  Code,
  Calculator,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  {
    icon: BookOpen,
    text: "Explain the concept of inheritance in OOP",
    category: "Programming",
  },
  {
    icon: Code,
    text: "Write a C program for binary search",
    category: "C Programming",
  },
  {
    icon: Calculator,
    text: "Solve: Find the Big O notation of nested loops",
    category: "Data Structures",
  },
  {
    icon: Lightbulb,
    text: "What is normalization in DBMS?",
    category: "Database",
  },
]

import { useAuth } from "@/lib/auth-context"

export default function AIChatPage() {
  const { askAI } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (content: string = input) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await askAI(content)
      if (result.success === false || result.error) {
        throw new Error(result.error || "Failed to get AI response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response || "No response received.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: err instanceof Error ? err.message : "Sorry, I encountered an error. Please try again.",
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
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col pb-16 lg:pb-0 position-relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Doubt Lab</h1>
          <p className="text-muted-foreground">
            Get instant answers to your academic queries
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChat} className="gap-2 bg-transparent">
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">How can I help you today?</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Ask me anything about your BCA subjects - programming, data structures, DBMS, and more!
            </p>

            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {suggestedQuestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(item.text)}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                    <p className="text-sm">{item.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        ) : (
          <ScrollArea className="flex-1 p-4 overflow-auto" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                      {/* <p className="whitespace-pre-wrap text-sm">{message.content}</p> */}
                    </div>
                    <p className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your doubt here... (Press Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[44px] w-[44px] shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            AI responses are for learning purposes. Always verify with your study materials.
          </p>
        </div>
      </Card>
    </div>
  )
}
