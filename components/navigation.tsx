"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Award, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/credentials", icon: Award, label: "Credentials" },
  { href: "/connect", icon: LinkIcon, label: "Connect" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto border-t md:border-b md:border-t-0 bg-gray-900/80 backdrop-blur-lg border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-8 h-16">
          <Link 
            href="/" 
            className="hidden md:flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            🏥 HealthBot
          </Link>
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
    </nav>
  )
}
