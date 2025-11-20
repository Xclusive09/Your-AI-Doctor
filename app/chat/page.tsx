"use client"

import { useState, useRef, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Loader2, Activity, Heart, AlertTriangle } from "lucide-react"
import { useHealthStore } from "@/store/useHealthStore"
import toast from "react-hot-toast"

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
  
  // Get health data for context
  const todayMetric = useHealthStore(state => state.getTodayMetric())
  const avgSteps = useHealthStore(state => state.getAverageSteps(7))
  const avgSleep = useHealthStore(state => state.getAverageSleep(7))
  const avgHRV = useHealthStore(state => state.getAverageHRV(7))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Proactive health check-in on mount
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('healthbot_welcome_shown')
    
    if (!hasShownWelcome && todayMetric) {
      // Show a proactive check-in message
      setTimeout(() => {
        const checkInMessage: Message = {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: `Hello! 👋 I'm HealthBot, your AI health companion. I've reviewed your recent health data:

📊 **Today's Metrics:**
- Steps: ${todayMetric.steps.toLocaleString()}
- Sleep: ${todayMetric.sleepHours}h
- HRV: ${todayMetric.hrv}ms

${todayMetric.steps < 5000 ? '⚠️ I notice your activity is low today. Would you like some motivation to get moving?' : ''}
${todayMetric.sleepHours < 6 ? '⚠️ You had limited sleep last night. Let me know if you need tips for better rest.' : ''}

How are you feeling today? Is there anything you'd like to discuss about your health?`
        }
        setMessages([checkInMessage])
        sessionStorage.setItem('healthbot_welcome_shown', 'true')
      }, 1000)
    }
  }, [todayMetric])

  const buildHealthContext = () => {
    if (!todayMetric) return null
    
    return {
      todaySteps: todayMetric.steps,
      averageSteps: avgSteps,
      todaySleep: todayMetric.sleepHours,
      averageSleep: avgSleep,
      currentHRV: todayMetric.hrv,
      averageHRV: avgHRV,
      glucose: todayMetric.glucose,
      restingHeartRate: todayMetric.restingHeartRate,
    }
  }

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
      const healthContext = buildHealthContext()
      
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
          healthContext,
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
      
      // Check if response contains danger alerts
      if (data.content && data.content.includes('⚠️ ALERT')) {
        toast.error('Health alert detected! Please review the AI response.', { duration: 5000 })
      }
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

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 md:pt-16 pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b px-4 py-4 md:px-8 border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-400" />
                AI Health Assistant
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Personalized health advice powered by your real-time data
              </p>
            </div>
            {todayMetric && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">{todayMetric.steps.toLocaleString()} steps</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300">{todayMetric.hrv}ms HRV</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2 text-white">How can I help you today?</h2>
              <p className="text-gray-400 mb-6">
                I&apos;m here to answer your health questions with personalized insights
              </p>
              <div className="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                <Card 
                  onClick={() => handleQuickQuestion("Give me tips to improve my step count")}
                  className="p-4 hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-gray-800/50 border-gray-700"
                >
                  <p className="text-sm font-medium text-white">💪 Exercise tips</p>
                </Card>
                <Card 
                  onClick={() => handleQuickQuestion("What should I eat for better energy?")}
                  className="p-4 hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-gray-800/50 border-gray-700"
                >
                  <p className="text-sm font-medium text-white">🥗 Nutrition advice</p>
                </Card>
                <Card 
                  onClick={() => handleQuickQuestion("How can I improve my sleep quality?")}
                  className="p-4 hover:bg-gray-700 cursor-pointer transition-colors backdrop-blur-sm bg-gray-800/50 border-gray-700"
                >
                  <p className="text-sm font-medium text-white">😴 Sleep guidance</p>
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white border-none"
                    : "backdrop-blur-sm bg-gray-800/80 border-gray-700 text-white"
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <Card className="p-4 backdrop-blur-sm bg-gray-800/80 border-gray-700">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-t px-4 py-4 md:px-8 border-gray-700">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 backdrop-blur-sm bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
