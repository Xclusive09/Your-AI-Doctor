"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Heart, TrendingUp, Zap, Award, Users } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const stats = [
    {
      title: "Health Score",
      value: "94",
      unit: "/100",
      icon: Activity,
      description: "+5% from last week",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Heart Rate",
      value: "72",
      unit: "bpm",
      icon: Heart,
      description: "Average resting",
      gradient: "from-red-500 to-pink-500",
    },
    {
      title: "Daily Steps",
      value: "8,432",
      unit: "",
      icon: TrendingUp,
      description: "Goal: 10,000",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Minutes",
      value: "45",
      unit: "min",
      icon: Zap,
      description: "Today's activity",
      gradient: "from-yellow-500 to-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to HealthBot
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your AI-powered health companion
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.title} 
                className="relative overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stat.value}
                    <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">{stat.unit}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Streak Card */}
        <Card className="mb-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">🔥 7 Day Streak!</CardTitle>
                <CardDescription className="mt-2">
                  Keep up the great work! You&apos;re on fire!
                </CardDescription>
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                7
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Audience Challenge Button */}
        <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border-purple-200 dark:border-purple-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Community Challenges
            </CardTitle>
            <CardDescription>
              Join challenges with other HealthBot users and earn exclusive badges!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">30-Day Step Challenge</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Walk 10,000 steps daily for 30 days
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">487 participants</span>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Join Now
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Heart Health Week</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Maintain optimal heart rate for 7 days
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">234 participants</span>
                  <Button size="sm" className="bg-gradient-to-r from-red-600 to-pink-600">
                    Join Now
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              asChild
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
            >
              <Link href="/chat">
                <Zap className="h-5 w-5 mr-2" />
                Talk to Your AI Health Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
