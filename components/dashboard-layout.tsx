"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Home,
  MessageSquare,
  ImageIcon,
  Users,
  BookOpen,
  Info,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react"
import { signOut } from "@/lib/actions"
import ProfileCustomization from "@/components/profile-customization"
import { ThemeSwitch } from "@/components/theme-switch"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Forums", href: "/dashboard/forums", icon: MessageSquare },
  { name: "Gallery", href: "/dashboard/gallery", icon: ImageIcon },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Blog", href: "/dashboard/blog", icon: BookOpen },
  { name: "About Us", href: "/dashboard/about", icon: Info },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    email?: string
    user_metadata?: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
      bio?: string
      location?: string
      avatar_url?: string
    }
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const userInitials =
    user.user_metadata?.firstName && user.user_metadata?.lastName
      ? `${user.user_metadata.firstName[0]}${user.user_metadata.lastName[0]}`
      : user.email?.[0].toUpperCase() ?? ""

  const userName =
    user.user_metadata?.firstName && user.user_metadata?.lastName
      ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
      : user.email ?? ""

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-foreground">Mahmood Ihsan Foundation</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:bg-card lg:border-r lg:border-border lg:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground font-serif">Mahmood Ihsan Foundation</h2>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-64 bg-input border-border" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <ThemeSwitch />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={userName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email ?? "No email provided"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Profile Customization */}
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Customize Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dialog - Outside of DropdownMenu */}
              <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Customize Your Profile</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Update your personal information and preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileCustomization user={user} onClose={() => setProfileDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-background min-h-screen">{children}</main>
      </div>
    </div>
  )
}
