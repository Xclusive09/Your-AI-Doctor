"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Watch, Activity, Scale, Check, Plus } from "lucide-react"
import { useState } from "react"

export default function ConnectPage() {
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: "Apple Health",
      icon: "🍎",
      description: "Sync data from Apple Watch and iPhone",
      connected: true,
      lastSync: "2 hours ago",
      metrics: ["Heart Rate", "Steps", "Sleep", "Workouts"],
      color: "from-gray-700 to-gray-900",
    },
    {
      id: 2,
      name: "Fitbit",
      icon: "⌚",
      description: "Track your Fitbit activities and health metrics",
      connected: true,
      lastSync: "5 hours ago",
      metrics: ["Steps", "Heart Rate", "Sleep", "Calories"],
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: 3,
      name: "Google Fit",
      icon: "🏃",
      description: "Connect your Google Fit account",
      connected: false,
      lastSync: null,
      metrics: ["Activity", "Steps", "Weight", "Nutrition"],
      color: "from-red-500 to-yellow-500",
    },
    {
      id: 4,
      name: "Oura Ring",
      icon: "💍",
      description: "Advanced sleep and readiness tracking",
      connected: false,
      lastSync: null,
      metrics: ["Sleep Quality", "Readiness", "HRV", "Temperature"],
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 5,
      name: "Whoop",
      icon: "💪",
      description: "Performance optimization and recovery",
      connected: false,
      lastSync: null,
      metrics: ["Strain", "Recovery", "Sleep", "HRV"],
      color: "from-gray-800 to-black",
    },
    {
      id: 6,
      name: "MyFitnessPal",
      icon: "🥗",
      description: "Nutrition and calorie tracking",
      connected: false,
      lastSync: null,
      metrics: ["Calories", "Macros", "Water", "Weight"],
      color: "from-blue-600 to-blue-800",
    },
  ])

  const toggleConnection = (id: number) => {
    setConnections(connections.map(conn => 
      conn.id === id 
        ? { ...conn, connected: !conn.connected, lastSync: !conn.connected ? "Just now" : null }
        : conn
    ))
  }

  const connectedCount = connections.filter(c => c.connected).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Connect Your Devices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sync your wearables and health apps to get comprehensive insights
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">Connected Sources</CardTitle>
                <CardDescription className="mt-2">
                  {connectedCount} of {connections.length} sources connected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                  <Check className="h-3 w-3 mr-1" />
                  {connectedCount} Active
                </Badge>
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
                  {connections.length - connectedCount} Available
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Connection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <Card 
              key={connection.id}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                connection.connected 
                  ? "bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg" 
                  : "bg-white/30 dark:bg-gray-800/30 border-white/10"
              }`}
            >
              {connection.connected && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${connection.color} text-4xl`}>
                    {connection.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{connection.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {connection.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {connection.connected && connection.lastSync && (
                  <div className="p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-400">
                        Last synced: {connection.lastSync}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Available Metrics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {connection.metrics.map((metric) => (
                      <Badge 
                        key={metric}
                        variant="outline"
                        className="text-xs bg-white/50 dark:bg-gray-900/50"
                      >
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => toggleConnection(connection.id)}
                  className={`w-full ${
                    connection.connected
                      ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {connection.connected ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your health data is encrypted end-to-end and never shared without your explicit consent. 
              All data synchronization happens securely through official APIs.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Watch className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Real-time Sync</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Automatic updates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Scale className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Zero-Knowledge</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Privacy first</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Verified Data</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">BlockDAG backed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
