"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Check, Lock, TrendingUp, Heart, Footprints, Moon, Zap, Shield } from "lucide-react"

export default function CredentialsPage() {
  const credentials = [
    {
      id: 1,
      name: "7-Day Streak Master",
      description: "Maintained health tracking for 7 consecutive days",
      icon: Zap,
      earned: true,
      date: "2024-11-10",
      gradient: "from-yellow-500 to-orange-500",
      verified: true,
    },
    {
      id: 2,
      name: "Heart Health Champion",
      description: "Maintained optimal heart rate for 30 days",
      icon: Heart,
      earned: true,
      date: "2024-11-15",
      gradient: "from-red-500 to-pink-500",
      verified: true,
    },
    {
      id: 3,
      name: "Step Count Pro",
      description: "Achieved 10,000 steps for 14 consecutive days",
      icon: Footprints,
      earned: true,
      date: "2024-11-12",
      gradient: "from-green-500 to-emerald-500",
      verified: true,
    },
    {
      id: 4,
      name: "Sleep Quality Expert",
      description: "Maintained 8+ hours of quality sleep for 7 days",
      icon: Moon,
      earned: false,
      date: null,
      gradient: "from-indigo-500 to-purple-500",
      verified: false,
    },
    {
      id: 5,
      name: "Fitness Enthusiast",
      description: "Completed 30 workout sessions",
      icon: TrendingUp,
      earned: false,
      date: null,
      gradient: "from-blue-500 to-cyan-500",
      verified: false,
    },
    {
      id: 6,
      name: "Wellness Warrior",
      description: "Maintained all health metrics for 90 days",
      icon: Shield,
      earned: false,
      date: null,
      gradient: "from-purple-500 to-pink-500",
      verified: false,
    },
  ]

  const earnedCount = credentials.filter(c => c.earned).length
  const totalCount = credentials.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Health Credentials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your verifiable health achievements on the BlockDAG network
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Badge Collection</CardTitle>
                <CardDescription className="mt-2">
                  You&apos;ve earned {earnedCount} out of {totalCount} badges
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.round((earnedCount / totalCount) * 100)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${(earnedCount / totalCount) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential) => {
            const Icon = credential.icon
            return (
              <Card 
                key={credential.id}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  credential.earned 
                    ? "backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/20 shadow-lg" 
                    : "backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border-white/10 opacity-60"
                }`}
              >
                {credential.earned && credential.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-6 rounded-full bg-gradient-to-br ${credential.gradient} ${
                      credential.earned ? "" : "opacity-50 grayscale"
                    }`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {credential.earned ? credential.name : (
                          <div className="flex items-center gap-2 justify-center">
                            <Lock className="h-4 w-4" />
                            {credential.name}
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription>{credential.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 border-t">
                  {credential.earned ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Earned on:</span>
                        <span className="font-medium">{credential.date}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-200 dark:border-purple-700 hover:from-blue-600/20 hover:to-purple-600/20"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View on BlockDAG
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Not Yet Earned
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* BlockDAG Info */}
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              About BlockDAG Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All your health achievements are cryptographically verified and stored on the BlockDAG network. 
              This means your credentials are tamper-proof, verifiable anywhere, and you maintain full control 
              over your health data. Zero-knowledge proofs ensure your privacy while proving your achievements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
