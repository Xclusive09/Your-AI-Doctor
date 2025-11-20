"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  // Initialize state from user prop directly
  const [name, setName] = useState(user?.name || user?.username || "")
  const [email] = useState(user?.email || "")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  const handleSave = () => {
    if (user) {
      updateUser({ name })
      toast.success("Profile updated successfully!")
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-gray-800/50 border-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your personal information
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Profile Avatar */}
          <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <Button variant="outline" className="bg-gray-900/50 border-gray-700 text-gray-300">
                  Change Avatar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    value={user.username}
                    disabled
                    className="pl-10 bg-gray-900/50 border-gray-700 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Your display name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-gray-900/50 border-gray-700 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Member Since</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    value={new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    disabled
                    className="pl-10 bg-gray-900/50 border-gray-700 text-gray-500"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
