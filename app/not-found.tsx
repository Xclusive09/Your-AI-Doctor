"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Heart } from "lucide-react"

export default function NotFound() {
  const healthJokes = [
    "Why did the doctor carry a red pen? In case they needed to draw blood! 🩸",
    "What do you call a doctor who fixes websites? A URLologist! 💻",
    "Why did the health app go to therapy? It had too many issues to track! 📱",
    "What's a skeleton's least favorite room? The living room! 💀",
    "Why don't scientists trust atoms? Because they make up everything, even your body! ⚛️",
  ]
  
  const randomJoke = healthJokes[Math.floor(Math.random() * healthJokes.length)]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Heart className="h-6 w-6 text-red-500 animate-pulse" />
            <h2 className="text-2xl font-semibold text-white">
              Page Not Found
            </h2>
            <Heart className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
        </div>
        
        <p className="text-gray-400 mb-8">
          Oops! Looks like this page took a sick day. But here&apos;s a health joke to make you feel better:
        </p>
        
        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/50 mb-8">
          <p className="text-lg text-white italic">
            &quot;{randomJoke}&quot;
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button 
            asChild
            size="lg"
            variant="outline"
            className="bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800/50"
          >
            <Link href="/chat">
              <Heart className="h-5 w-5 mr-2" />
              Talk to AI Doctor
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
