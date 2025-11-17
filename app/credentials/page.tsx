"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Check, Lock, TrendingUp, Heart, Footprints, Moon, Zap, Shield, Trophy, Target } from "lucide-react"
import { useHealthStore } from "@/store/useHealthStore"
import { mintHealthCredential, storeCredential, getTxExplorerUrl } from "@/lib/blockdag"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"

export default function CredentialsPage() {
  const [minting, setMinting] = useState<string | null>(null)
  const checkBadgeEligibility = useHealthStore(state => state.checkBadgeEligibility)
  
  // Mock user address
  const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  
  const credentials = [
    {
      id: 'verified-walker',
      name: "Verified Walker",
      description: "Achieved 10,000+ steps for 90 consecutive days",
      icon: Footprints,
      gradient: "from-green-500 to-emerald-500",
      rarity: "Epic",
    },
    {
      id: 'deep-sleep-master',
      name: "Deep Sleep Master",
      description: "Maintained 8+ hours of quality sleep for 60 nights",
      icon: Moon,
      gradient: "from-indigo-500 to-purple-500",
      rarity: "Rare",
    },
    {
      id: 'metabolic-champion',
      name: "Metabolic Champion",
      description: "30-day glucose standard deviation under 15 mg/dL",
      icon: Target,
      gradient: "from-cyan-500 to-blue-500",
      rarity: "Epic",
    },
    {
      id: 'cardio-elite',
      name: "Cardio Elite",
      description: "90-day average HRV above 70ms",
      icon: Heart,
      gradient: "from-red-500 to-pink-500",
      rarity: "Legendary",
    },
    {
      id: 'century-club',
      name: "Century Club",
      description: "100,000 steps achieved in a single week",
      icon: Trophy,
      gradient: "from-yellow-500 to-orange-500",
      rarity: "Legendary",
    },
    {
      id: '7-day-streak',
      name: "7-Day Streak Master",
      description: "Maintained health tracking for 7 consecutive days",
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
      rarity: "Common",
    },
  ]
  
  const handleClaimBadge = async (credential: typeof credentials[0]) => {
    const eligible = checkBadgeEligibility(credential.id)
    
    if (!eligible) {
      toast.error("You haven't met the requirements for this badge yet!")
      return
    }
    
    setMinting(credential.id)
    toast.loading("Minting credential on BlockDAG...", { id: 'mint' })
    
    try {
      const result = await mintHealthCredential(
        userAddress,
        credential.id,
        {
          name: credential.name,
          description: credential.description,
          earnedDate: new Date().toISOString(),
        }
      )
      
      if (result) {
        storeCredential(result)
        
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        toast.success(
          <div>
            <p className="font-semibold">🎉 Badge Claimed!</p>
            <a 
              href={getTxExplorerUrl(result.txHash || '')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View on BlockDAG →
            </a>
          </div>,
          { id: 'mint', duration: 5000 }
        )
      }
    } catch (error) {
      toast.error("Failed to mint credential. Please try again.", { id: 'mint' })
    } finally {
      setMinting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Health Credentials
          </h1>
          <p className="text-gray-400 text-lg">
            Your verifiable health achievements on the BlockDAG network
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Badge Collection</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  Earn badges by achieving health milestones
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {credentials.filter(c => checkBadgeEligibility(c.id)).length}/{credentials.length}
                </div>
                <p className="text-sm text-gray-500">Eligible</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential) => {
            const Icon = credential.icon
            const eligible = checkBadgeEligibility(credential.id)
            const isCurrentlyMinting = minting === credential.id
            
            return (
              <Card 
                key={credential.id}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  eligible
                    ? "backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg" 
                    : "backdrop-blur-sm bg-gray-800/30 border-gray-700/50 opacity-60"
                }`}
              >
                {eligible && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none">
                      <Check className="h-3 w-3 mr-1" />
                      Eligible
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-6 rounded-full bg-gradient-to-br ${credential.gradient} ${
                      eligible ? "" : "opacity-50 grayscale"
                    }`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2 text-white">
                        {eligible ? credential.name : (
                          <div className="flex items-center gap-2 justify-center">
                            <Lock className="h-4 w-4" />
                            {credential.name}
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-400">{credential.description}</CardDescription>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 ${
                          credential.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          credential.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
                          credential.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        }`}
                      >
                        {credential.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 border-t border-gray-700">
                  {eligible ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleClaimBadge(credential)}
                        disabled={isCurrentlyMinting}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isCurrentlyMinting ? (
                          <>
                            <Zap className="h-4 w-4 mr-2 animate-spin" />
                            Minting...
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Claim Badge
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 text-gray-300"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Prove Privately
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full bg-gray-900/50 border-gray-700 text-gray-500" 
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
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-purple-400" />
              About BlockDAG Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">
              All your health achievements are cryptographically verified and stored as soulbound tokens on the BlockDAG network. 
              This means your credentials are tamper-proof, verifiable anywhere, and you maintain full control 
              over your health data. Zero-knowledge proofs ensure your privacy while proving your achievements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
