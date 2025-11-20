"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Heart, 
  Shield, 
  Zap, 
  Award, 
  TrendingUp, 
  Lock, 
  Users, 
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Brain,
  Database,
  Smartphone
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const features = [
    {
      icon: Brain,
      title: "AI Health Doctor",
      description: "Chat with an AI-powered doctor that understands your health context and provides personalized medical guidance 24/7.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Blockchain Health Passport",
      description: "Secure, verifiable health credentials on BlockDAG blockchain. Your health achievements are permanently yours.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Activity,
      title: "Real-Time Health Tracking",
      description: "Track steps, sleep, heart rate, glucose, and more. Connect your favorite wearables and health apps seamlessly.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Earn Health Credentials",
      description: "Achieve health milestones and earn blockchain-verified badges. Prove your health journey with zero-knowledge proofs.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your health data is encrypted end-to-end. You control what to share and who can access your information.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Users,
      title: "Community Challenges",
      description: "Join health challenges with others, compete on leaderboards, and stay motivated with community support.",
      gradient: "from-pink-500 to-rose-500"
    }
  ]

  const stats = [
    { value: "10,000+", label: "TPS on BlockDAG" },
    { value: "24/7", label: "AI Health Support" },
    { value: "100%", label: "Privacy Protected" },
    { value: "6+", label: "Health Sources" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 mb-6">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Powered by AI & BlockDAG</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Your AI Health Doctor & Blockchain Passport
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of healthcare with AI-powered medical guidance and blockchain-verified health credentials. 
            Track, verify, and own your health journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50"
            >
              <Link href="/signup">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Everything You Need for Complete Health Management
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            HealthBot combines cutting-edge AI, blockchain technology, and health tracking in one powerful platform
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={feature.title} 
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                  1
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Connect Your Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Link your Apple Health, Google Fit, Oura, Whoop, or any wearable. Upload CSV files or use demo data to get started.
                </p>
                <div className="flex gap-2 mt-4">
                  <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                  2
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Chat with AI Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Get personalized health advice from our AI doctor. Ask questions about exercise, nutrition, sleep, or any health concern.
                </p>
                <div className="flex gap-2 mt-4">
                  <MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-600 to-green-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                  3
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Earn Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Achieve health milestones and earn blockchain-verified badges. Mint them on BlockDAG and prove your achievements privately.
                </p>
                <div className="flex gap-2 mt-4">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust & Security */}
        <Card className="mb-20 backdrop-blur-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl text-gray-900 dark:text-white">Your Privacy is Our Priority</CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
              Built with security and privacy at the core
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <Lock className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your health data is encrypted and only you have the keys</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Blockchain Verified</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Credentials secured on BlockDAG&apos;s immutable ledger</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">You Control Your Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose what to share, when to share, and with whom</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="backdrop-blur-sm bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 border-0 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Health Journey?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of users who trust HealthBot for their health management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100"
              >
                <Link href="/signup">
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/login">
                  Already Have Account?
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
