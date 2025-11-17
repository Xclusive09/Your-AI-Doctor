"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Heart, TrendingUp, Zap, Award, Users, Flame, Target, Moon, Droplets } from "lucide-react"
import Link from "next/link"
import { useHealthStore } from "@/store/useHealthStore"
import { batchMintCredentials, getExplorerUrl } from "@/lib/blockdag"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"

export default function Dashboard() {
  const [isMinting, setIsMinting] = useState(false)
  const [mintCount, setMintCount] = useState(0)
  const todayMetric = useHealthStore(state => state.getTodayMetric())
  const avgSteps = useHealthStore(state => state.getAverageSteps(7))
  const avgSleep = useHealthStore(state => state.getAverageSleep(7))
  const avgHRV = useHealthStore(state => state.getAverageHRV(7))
  
  // Mock user address for demo
  const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  
  const stats = [
    {
      title: "Today's Steps",
      value: todayMetric?.steps.toLocaleString() || "0",
      unit: "",
      icon: TrendingUp,
      description: `7-day avg: ${avgSteps.toLocaleString()}`,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Last Night Sleep",
      value: todayMetric?.sleepHours.toString() || "0",
      unit: "hrs",
      icon: Moon,
      description: `7-day avg: ${avgSleep}h`,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Current Glucose",
      value: todayMetric?.glucose.toString() || "0",
      unit: "mg/dL",
      icon: Droplets,
      description: "Optimal range",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "HRV Trend",
      value: avgHRV.toString(),
      unit: "ms",
      icon: Heart,
      description: "7-day average",
      gradient: "from-red-500 to-pink-500",
    },
  ]
  
  const handleAudienceChallenge = async () => {
    setIsMinting(true)
    setMintCount(0)
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    
    toast.success("Starting Audience Challenge! 🚀")
    
    try {
      await batchMintCredentials(userAddress, 200, (current) => {
        setMintCount(current)
        
        // More confetti at milestones
        if (current % 50 === 0) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          })
        }
      })
      
      // Final celebration
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      })
      
      toast.success("🎉 200 credentials minted on BlockDAG!")
    } catch (error) {
      toast.error("Challenge failed. Please try again.")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome back, Alex. You&apos;re crushing it.
          </h1>
          <p className="text-gray-400 text-lg">
            Your health journey powered by BlockDAG
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.title} 
                className="relative overflow-hidden backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                    <span className="text-lg text-gray-400 ml-1">{stat.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Streak Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  7 Day Streak!
                </CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  Keep up the great work! You&apos;re on fire!
                </CardDescription>
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                7
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Audience Challenge - Big Purple Button */}
        <Card className="mb-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 animate-pulse"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-3xl text-white flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-400" />
              🎯 Audience Challenge
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Witness BlockDAG&apos;s 10,000+ TPS! Mint 200 credentials instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            {isMinting && (
              <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/50">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {mintCount}
                  </div>
                  <p className="text-gray-400">credentials minted</p>
                </div>
                <div className="mt-4 w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 transition-all duration-300"
                    style={{ width: `${(mintCount / 200) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleAudienceChallenge}
              disabled={isMinting}
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl py-8 shadow-lg shadow-purple-500/50"
            >
              {isMinting ? (
                <>
                  <Zap className="h-6 w-6 mr-2 animate-spin" />
                  Minting {mintCount}/200...
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6 mr-2" />
                  Start Audience Challenge 🚀
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-400">
              This will mint 200 credentials in ~4 seconds on BlockDAG testnet
            </p>
          </CardContent>
        </Card>

        {/* Community Challenges */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-white">
              <Users className="h-6 w-6 text-purple-400" />
              Community Challenges
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join challenges with other HealthBot users and earn exclusive badges!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-semibold text-white">30-Day Step Challenge</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Walk 10,000 steps daily for 30 days
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">487 participants</span>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Join Now
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  <h3 className="font-semibold text-white">Heart Health Week</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Maintain optimal heart rate for 7 days
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">234 participants</span>
                  <Button size="sm" className="bg-gradient-to-r from-red-600 to-pink-600">
                    Join Now
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              asChild
              size="lg" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-6"
            >
              <Link href="/chat">
                <Activity className="h-5 w-5 mr-2" />
                Talk to Your AI Health Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* BlockDAG Explorer */}
        <Card className="backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-cyan-400" />
              BlockDAG Explorer
            </CardTitle>
            <CardDescription className="text-gray-400">
              Live view of your wallet on BlockDAG testnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-700">
              <iframe
                src={getExplorerUrl(userAddress)}
                className="w-full h-full"
                title="BlockDAG Explorer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Address: {userAddress}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
