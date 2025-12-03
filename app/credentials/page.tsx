"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Check, Lock, Heart, Footprints, Moon, Zap, Shield, Trophy, Target, Download, Share2, Copy } from "lucide-react"
import { useHealthStore } from "@/store/useHealthStore"
import { useAuthStore } from "@/store/useAuthStore"
import { 
  mintHealthCredential, 
  storeCredential, 
  getTxExplorerUrl,
  connectWallet,
  getTokenBalance,
  getCredentialsForAddress,
  verifyCredential,
  type HealthCredential
} from "@/lib/blockdag"
import { downloadBadgeImage, copyShareLink, shareBadgeNative, generateShareText } from "@/lib/badgeGenerator"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"

export default function CredentialsPage() {
  const [minting, setMinting] = useState<string | null>(null)
  const [claimedBadges, setClaimedBadges] = useState<Set<string>>(new Set())
  const [sharingBadge, setSharingBadge] = useState<string | null>(null)
  const checkBadgeEligibility = useHealthStore(state => state.checkBadgeEligibility)
  const { user } = useAuthStore()
  
  // Use connected wallet address or fallback
  const [userAddress, setUserAddress] = useState<string>("")
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [existingCredentials, setExistingCredentials] = useState<HealthCredential[]>([])
  
  useEffect(() => {
    // Try to get connected wallet address
    const getWalletAddress = async () => {
      try {
        const address = await connectWallet()
        if (address) {
          setUserAddress(address)
          
          // Load blockchain data
          const balance = await getTokenBalance(address)
          setTokenBalance(balance)
          
          const credentials = await getCredentialsForAddress(address)
          // Deduplicate credentials by tokenId
          const uniqueCredentials = credentials.filter((cred, index, self) => 
            index === self.findIndex(c => c.tokenId === cred.tokenId)
          )
          setExistingCredentials(uniqueCredentials)
        }
      } catch {
        // Fallback to mock address
        setUserAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
      }
    }
    getWalletAddress()
  }, [])
  
  // Verify credential function
  const handleVerifyCredential = async (tokenId: string) => {
    toast.loading("Verifying credential on blockchain...", { id: 'verify' })
    
    try {
      const isValid = await verifyCredential(tokenId)
      
      if (isValid) {
        toast.success("✅ Credential is valid and verified!", { id: 'verify' })
      } else {
        toast.error("❌ Credential verification failed", { id: 'verify' })
      }
    } catch {
      toast.error("Failed to verify credential", { id: 'verify' })
    }
  }
  
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
        setClaimedBadges(prev => new Set(prev).add(credential.id))
        
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
    } catch {
      toast.error("Failed to mint credential. Please try again.", { id: 'mint' })
    } finally {
      setMinting(null)
    }
  }

  const handleDownloadBadge = async (credential: typeof credentials[0]) => {
    try {
      toast.loading("Generating badge image...", { id: 'download' })
      await downloadBadgeImage({
        id: credential.id,
        name: credential.name,
        description: credential.description,
        rarity: credential.rarity,
        earnedDate: new Date().toISOString(),
        username: user?.username || 'HealthBot User',
      })
      toast.success("Badge downloaded successfully!", { id: 'download' })
    } catch {
      toast.error("Failed to download badge", { id: 'download' })
    }
  }

  const handleShareBadge = async (credential: typeof credentials[0]) => {
    setSharingBadge(credential.id)
    
    const badgeData = {
      id: credential.id,
      name: credential.name,
      description: credential.description,
      rarity: credential.rarity,
      earnedDate: new Date().toISOString(),
      username: user?.username || 'HealthBot User',
    }
    
    // Try native share first (mobile)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await shareBadgeNative(badgeData)
        toast.success("Badge shared successfully!")
        setSharingBadge(null)
        return
      } catch {
        // Fall through to copy link
      }
    }
    
    // Copy link to clipboard
    try {
      await copyShareLink(badgeData)
      toast.success("Share link copied to clipboard!")
    } catch {
      toast.error("Failed to copy share link")
    }
    
    setSharingBadge(null)
  }

  const handleCopyShareText = (credential: typeof credentials[0]) => {
    const badgeData = {
      id: credential.id,
      name: credential.name,
      description: credential.description,
      rarity: credential.rarity,
      earnedDate: new Date().toISOString(),
      username: user?.username || 'HealthBot User',
    }
    
    const shareText = generateShareText(badgeData)
    navigator.clipboard.writeText(shareText)
    toast.success("Share text copied! Ready to post on social media 🎉")
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

        {/* Blockchain Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Health Passport Status</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  Your blockchain-verified health credentials
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">{tokenBalance}</div>
                <div className="text-sm text-gray-400">Total Credentials</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-green-400">{existingCredentials.length}</div>
                <div className="text-sm text-gray-400">Earned Credentials</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-blue-400">{userAddress ? `${userAddress.slice(0,6)}...${userAddress.slice(-4)}` : 'Not Connected'}</div>
                <div className="text-sm text-gray-400">Wallet Address</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-purple-400">{claimedBadges.size}</div>
                <div className="text-sm text-gray-400">Session Claims</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Credentials Section */}
        {existingCredentials.length > 0 && (
          <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-white">Your Verified Credentials</CardTitle>
              <CardDescription className="text-gray-400">
                Blockchain-verified health achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingCredentials.map((cred, index) => (
                  <div key={`${cred.tokenId}-${index}`} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{cred.metadata.name}</h3>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        ✓ Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{cred.metadata.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Token #{cred.tokenId}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyCredential(cred.tokenId)}
                        className="h-6 px-2 text-xs"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badge Collection */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Available Badges</CardTitle>
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
                      {!claimedBadges.has(credential.id) ? (
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
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleDownloadBadge(credential)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              onClick={() => handleShareBadge(credential)}
                              disabled={sharingBadge === credential.id}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            >
                              {sharingBadge === credential.id ? (
                                <Zap className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Share2 className="h-4 w-4 mr-2" />
                              )}
                              Share
                            </Button>
                          </div>
                          <Button 
                            onClick={() => handleCopyShareText(credential)}
                            variant="outline" 
                            className="w-full bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 text-gray-300"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Share Text
                          </Button>
                        </div>
                      )}
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
