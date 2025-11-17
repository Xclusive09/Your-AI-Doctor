"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "I apologize, but I couldn't generate a response.",
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 md:pt-16 pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b px-4 py-4 md:px-8 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            AI Health Assistant
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ask me anything about your health and wellness
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 text-blue-600 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                I&apos;m here to answer your health questions and provide guidance
              </p>
              <div className="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20">
                  <p className="text-sm font-medium">💪 Exercise tips</p>
                </Card>
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20">
                  <p className="text-sm font-medium">🥗 Nutrition advice</p>
                </Card>
                <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20">
                  <p className="text-sm font-medium">😴 Sleep guidance</p>
                </Card>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none"
                    : "backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-white/20"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Card className="p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-white/20">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t px-4 py-4 md:px-8 border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-white/20"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
