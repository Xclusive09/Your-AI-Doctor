"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, Shield, Moon, Globe, ArrowLeft, LogOut, Sun } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useThemeStore } from "@/store/useThemeStore"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const {
    notifications,
    healthAlerts,
    weeklyReports,
    dataSharing,
    setNotifications,
    setHealthAlerts,
    setWeeklyReports,
    setDataSharing,
  } = useSettingsStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/login")
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your preferences and account settings
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Notifications */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">Notifications</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on this device</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Health Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get alerts for abnormal health metrics</p>
                </div>
                <Switch checked={healthAlerts} onCheckedChange={setHealthAlerts} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly health summary emails</p>
                </div>
                <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                )}
                <CardTitle className="text-xl text-gray-900 dark:text-white">Appearance</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Customize the look and feel of the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme === 'dark' ? 'Using dark theme' : 'Using light theme'}
                  </p>
                </div>
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={() => {
                    toggleTheme()
                    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`)
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">Privacy & Security</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Data Sharing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Share anonymized data for research</p>
                </div>
                <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
              </div>
              <Button
                variant="outline"
                className="w-full bg-white/50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
            </CardContent>
          </Card>

          {/* AI Chat Context */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">AI Chat Context</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure what data the AI assistant can access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The AI assistant uses your health data to provide personalized advice. You can control what information is shared:
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">✅ Activity Data</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Steps, workouts, and exercise metrics</p>
                </div>
                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">✅ Sleep Data</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sleep duration, quality, and patterns</p>
                </div>
                <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">✅ Health Metrics</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Heart rate, HRV, glucose levels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="backdrop-blur-sm bg-red-500/10 border-red-400 dark:border-red-500/50 shadow-lg">
            <CardContent className="pt-6">
              <Button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
