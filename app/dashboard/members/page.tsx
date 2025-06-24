"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, UserPlus, Users, Ban, Phone, Mail, Calendar } from "lucide-react"
import { banUser } from "@/lib/actions"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/components/ui/toast"
import { getUserAvatarUrl, getUserInitials } from "@/lib/utils"

interface Member {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  avatar: string
  initials: string
  createdAt: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{
    id: string
    email: string
    user_metadata?: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
      bio?: string
      location?: string
      avatar_url?: string
    }
  } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [banningUserId, setBanningUserId] = useState<string | null>(null)
  const [showBanConfirm, setShowBanConfirm] = useState<string | null>(null)
  const { toast, toasts } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect("/auth/login")
        return
      }
      
      setUser({
        id: user.id,
        email: user.email || "",
        user_metadata: user.user_metadata
      })
      setIsAdmin(user.email === "sadiq.rasheed@outlook.com")

      // Fetch all users from auth.users to get avatar URLs
      const { data: users, error } = await supabase.auth.admin.listUsers()

      if (error) {
        console.error("Error fetching users:", error)
        return
      }

      // Transform users into member format
      const membersData = users?.map((userData: {
        id: string
        email?: string
        user_metadata?: {
          firstName?: string
          lastName?: string
          phoneNumber?: string
        }
        created_at: string
      }) => {
        const firstName = userData.user_metadata?.firstName || ""
        const lastName = userData.user_metadata?.lastName || ""
        const fullName = `${firstName} ${lastName}`.trim() || userData.email?.split("@")[0] || "Unknown User"
        const phoneNumber = userData.user_metadata?.phoneNumber || "No phone number"
        const email = userData.email || "No email"

        return {
          id: userData.id,
          fullName,
          email,
          phoneNumber,
          avatar: getUserAvatarUrl(userData),
          initials: getUserInitials(userData),
          createdAt: userData.created_at,
        }
      }) || []

      setMembers(membersData)
      setFilteredMembers(membersData)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter members based on search term
  useEffect(() => {
    const filtered = members.filter((member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const handleBanUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can ban users.",
        variant: "destructive",
      })
      return
    }

    setBanningUserId(userId)
    setShowBanConfirm(null)

    try {
      const result = await banUser(userId)
      
      if (result.success) {
        toast({
          title: "User Banned",
          description: `${userName} has been banned and all their content has been removed.`,
        })
        
        // Remove the banned user from the local state
        setMembers(prev => prev.filter(member => member.id !== userId))
        setFilteredMembers(prev => prev.filter(member => member.id !== userId))
      } else {
        toast({
          title: "Ban Failed",
          description: result.error || "Failed to ban user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while banning the user.",
        variant: "destructive",
      })
    } finally {
      setBanningUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={{
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata
    }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground">Manage community members</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-card-foreground truncate mb-2">
                      {member.fullName}
                    </h3>
                    
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {member.phoneNumber !== "No phone number" ? member.phoneNumber : "No phone number"}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Actions */}
                {isAdmin && member.email !== "sadiq.rasheed@outlook.com" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {showBanConfirm === member.id ? (
                      <div className="space-y-2">
                        <div className="text-sm text-destructive font-medium">
                          Are you sure? This will permanently delete the user and all their content.
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleBanUser(member.id, member.fullName)}
                            disabled={banningUserId === member.id}
                          >
                            {banningUserId === member.id ? (
                              <Loading size="sm" />
                            ) : (
                              "Confirm Ban"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowBanConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowBanConfirm(member.id)}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No members found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "No members have joined yet."}
            </p>
          </div>
        )}

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <div key={toast.id} className="fixed top-4 right-4 z-50">
            <div className={`p-4 rounded-lg border shadow-lg ${
              toast.variant === "destructive" 
                ? "border-destructive bg-destructive/10 text-destructive" 
                : "border-border bg-background text-foreground"
            }`}>
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              {toast.description && <div className="text-sm mt-1">{toast.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
