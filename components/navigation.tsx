"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, Award, Link as LinkIcon, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useState, useEffect, useRef } from "react"

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/credentials", icon: Award, label: "Credentials" },
  { href: "/connect", icon: LinkIcon, label: "Connect" },
  // Development test page - remove in production
  ...(process.env.NODE_ENV === 'development' ? [{ href: "/test", icon: Settings, label: "Test" }] : []),
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    router.push('/login')
  }

  // Hide navigation on login/signup/landing pages
  if (pathname === '/login' || pathname === '/signup' || (pathname === '/' && !isAuthenticated)) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto border-t md:border-b md:border-t-0 bg-gray-900/80 backdrop-blur-lg border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="hidden md:flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            >
              🏥 HealthBot
            </Link>
            <div className="flex items-center justify-around md:justify-start md:gap-8 flex-1 md:flex-initial">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all",
                      isActive
                        ? "text-purple-400 font-semibold"
                        : "text-gray-400 hover:text-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs md:text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Profile Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-gray-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-gray-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
