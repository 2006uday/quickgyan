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
  const { askAI, getAIHistory, clearAIHistory } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchHistory = async () => {
    try {
      const res = await getAIHistory()
      if (res.success && res.data?.messages) {
        const historyMessages = res.data.messages.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt)
        }))
        setMessages(historyMessages)
      }
    } catch (err) {
      console.error("Failed to fetch history:", err)
    } finally {
      setIsHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

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

  const clearChat = async () => {
    if (isLoading) return
    const res = await clearAIHistory()
    if (res.success) {
      setMessages([])
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex-col pb-4 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI Doubt Lab</h1>
          <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-none">
            Get instant answers to your academic queries
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2 h-8 px-2 md:h-10 md:px-4">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden border-border/50 shadow-sm">
        {isHistoryLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <CardContent className="flex flex-1 flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="mb-4 md:mb-6 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-center">How can I help you today?</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
              Ask me anything about your BCA subjects - programming, data structures, DBMS, and more!
            </p>

            <div className="mt-6 md:mt-8 grid w-full max-w-2xl gap-2 md:gap-3 grid-cols-1 sm:grid-cols-2">
              {suggestedQuestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(item.text)}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-all hover:bg-muted/50 hover:border-primary/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.category}</p>
                    <p className="text-sm line-clamp-2">{item.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        ) : (
          <ScrollArea className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 md:gap-3 px-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-1 border border-primary/20 shadow-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[88%] md:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none ring-1 ring-primary/20 shadow-primary/20"
                        : "bg-muted/80 backdrop-blur-sm rounded-tl-none border border-border/50 shadow-md"
                    )}
                  >
                    <div className={cn(
                      "prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed",
                      message.role === "user" ? "prose-p:text-primary-foreground/90" : "prose-p:text-foreground/90"
                    )}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ node, ...props }) => (
                            <code className="bg-slate-900/10 text-slate-900 dark:bg-slate-100/10 dark:text-slate-100 rounded px-1.5 py-0.5 font-mono text-xs font-semibold" {...props} />
                          ),
                          pre: ({ node, ...props }) => (
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl border border-slate-800 overflow-x-auto my-4 shadow-xl scrollbar-thin" {...props} />
                          ),
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-2 my-3" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-2 my-3" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-primary/40 pl-4 py-2 italic bg-primary/5 rounded-r-xl my-4 text-foreground/80" {...props} />
                          ),
                          a: ({ node, ...props }) => <a className="text-primary hover:underline font-semibold decoration-primary/30 underline-offset-4" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-4 mb-2" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1.5 opacity-40 select-none">
                      <span className="text-[10px] font-medium tracking-tight">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary mt-1 shadow-md shadow-primary/30 border border-primary/20">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 md:gap-3">
                  <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-muted px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-3 md:p-4 bg-background">
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Type your doubt here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none bg-muted/30 focus-visible:ring-primary/20 transition-all border-none"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[44px] w-[44px] shrink-0 rounded-xl"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="mt-2 text-[10px] md:text-xs text-muted-foreground text-center">
            AI responses are for learning purposes. Always verify with your materials.
          </p>
        </div>
      </Card>
    </div>
  )
}
