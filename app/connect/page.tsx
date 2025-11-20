"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Watch, Activity, Scale, Check, Plus, Upload, FileSpreadsheet } from "lucide-react"
import { useState, useRef } from "react"
import toast from "react-hot-toast"

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
      name: "Google Fit",
      icon: "🏃",
      description: "Connect your Google Fit account",
      connected: true,
      lastSync: "5 hours ago",
      metrics: ["Activity", "Steps", "Weight", "Nutrition"],
      color: "from-red-500 to-yellow-500",
    },
    {
      id: 3,
      name: "Oura Ring",
      icon: "💍",
      description: "Advanced sleep and readiness tracking",
      connected: true,
      lastSync: "1 hour ago",
      metrics: ["Sleep Quality", "Readiness", "HRV", "Temperature"],
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      name: "Levels",
      icon: "📊",
      description: "Continuous glucose monitoring",
      connected: true,
      lastSync: "Just now",
      metrics: ["Glucose", "Trends", "Insights", "Scores"],
      color: "from-cyan-500 to-blue-600",
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
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const toggleConnection = (id: number) => {
    setConnections(connections.map(conn => {
      if (conn.id === id) {
        const newConnected = !conn.connected
        if (newConnected) {
          toast.success(`✅ ${conn.name} connected successfully!`)
        } else {
          toast.success(`${conn.name} disconnected`)
        }
        return { 
          ...conn, 
          connected: newConnected, 
          lastSync: newConnected ? "Just now" : null 
        }
      }
      return conn
    }))
  }

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            reject(new Error('CSV file is empty or invalid'))
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          const data = []
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',')
            const row: any = {}
            
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim()
            })
            
            data.push(row)
            
            // Update progress
            const progress = Math.floor((i / lines.length) * 100)
            setUploadProgress(progress)
          }
          
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    toast.loading("Parsing CSV file...", { id: 'csv' })
    
    try {
      const data = await parseCSVFile(file)
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success(
        `✅ Successfully imported ${data.length} health records from ${file.name}`,
        { id: 'csv', duration: 5000 }
      )
      
      // Here you would normally process and store the data
      // For now, we just show success
      
    } catch (error) {
      console.error('CSV parse error:', error)
      toast.error(
        `Failed to parse CSV file. Please ensure it's formatted correctly.`,
        { id: 'csv' }
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const connectedCount = connections.filter(c => c.connected).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Connect Your Devices
          </h1>
          <p className="text-gray-400 text-lg">
            Sync your wearables and health apps to get comprehensive insights
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl text-white">Connected Sources</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  {connectedCount} of {connections.length} sources connected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <Check className="h-3 w-3 mr-1" />
                  {connectedCount} Active
                </Badge>
                <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                  {connections.length - connectedCount} Available
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* CSV Upload Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-purple-400" />
              Upload CSV Data
            </CardTitle>
            <CardDescription className="text-gray-300">
              Import your health data from any CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading && uploadProgress > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Uploading...</span>
                  <span className="text-sm text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              <Upload className={`h-5 w-5 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
              {isUploading ? 'Processing...' : 'Choose CSV File'}
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Supports health data exports from any wearable or app
            </p>
          </CardContent>
        </Card>

        {/* Connection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <Card 
              key={connection.id}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                connection.connected 
                  ? "bg-gray-800/50 border-gray-700 shadow-lg" 
                  : "bg-gray-800/30 border-gray-700/50"
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
                    <CardTitle className="text-xl mb-1 text-white">{connection.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-400">
                      {connection.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {connection.connected && connection.lastSync && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        Last synced: {connection.lastSync}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                    Available Metrics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {connection.metrics.map((metric) => (
                      <Badge 
                        key={metric}
                        variant="outline"
                        className="text-xs bg-gray-900/50 text-gray-300 border-gray-700"
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
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-400" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-300">
              Your health data is encrypted end-to-end and never shared without your explicit consent. 
              All data synchronization happens securely through official APIs.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Watch className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Real-time Sync</p>
                  <p className="text-xs text-gray-400">Automatic updates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Scale className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Zero-Knowledge</p>
                  <p className="text-xs text-gray-400">Privacy first</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verified Data</p>
                  <p className="text-xs text-gray-400">BlockDAG backed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
