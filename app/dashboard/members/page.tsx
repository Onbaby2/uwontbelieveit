"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, UserPlus, Users, Ban, Phone, Mail, Calendar, MapPin, User } from "lucide-react"
import { banUser } from "@/lib/actions"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/components/ui/toast"

interface Member {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number: string
  avatar_url: string
  bio: string
  location: string
  created_at: string
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      setIsAdmin(
        user.email === "sadiq.rasheed@outlook.com" || 
        user.id === "249ed938-df8c-41f2-9a3c-bc511fe68b94"
      )

      // Fetch all user profiles from the user_profiles table
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching user profiles:", error)
        toast({
          title: "Error",
          description: "Failed to load members. Please try again.",
          variant: "destructive",
        })
        return
      }

      setMembers(profiles || [])
      setFilteredMembers(profiles || [])
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading members.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter members based on search term
  useEffect(() => {
    const filtered = members.filter((member) =>
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getInitials = (member: Member) => {
    if (member.first_name && member.last_name) {
      return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
    }
    if (member.full_name) {
      const parts = member.full_name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return parts[0][0].toUpperCase()
    }
    return member.email[0].toUpperCase()
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Joined today"
    if (diffDays <= 7) return `Joined ${diffDays} days ago`
    if (diffDays <= 30) return `Joined ${Math.ceil(diffDays / 7)} weeks ago`
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format US phone numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    
    // Return original if can't format
    return phone
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Members</h1>
            <p className="text-muted-foreground">
              {members.length} {members.length === 1 ? 'member' : 'members'} in the Mahmood Ihsan Foundation community
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="mr-1 h-3 w-3" />
              {members.length} Total
            </Badge>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or location..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative mx-auto">
                    <Avatar className="h-16 w-16 mx-auto ring-2 ring-background shadow-lg">
                      <AvatarImage 
                        src={member.avatar_url || ''} 
                        alt={member.full_name || member.email}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>

                                     {/* Name */}
                   <div>
                     <h3 className="text-lg font-semibold text-card-foreground truncate">
                       {member.full_name || 
                        (member.first_name && member.last_name ? `${member.first_name} ${member.last_name}` : '') ||
                        member.first_name || 
                        member.last_name || 
                        member.email.split('@')[0]}
                     </h3>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                        {member.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground truncate" title={member.email}>
                        {member.email}
                      </p>
                    </div>
                    
                                         {member.phone_number && (
                       <div className="flex items-center space-x-2">
                         <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                         <p className="text-sm text-muted-foreground">
                           {formatPhoneNumber(member.phone_number)}
                         </p>
                       </div>
                     )}
                    
                    {member.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground truncate" title={member.location}>
                          {member.location}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {formatJoinDate(member.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Button variant="outline" className="w-full" size="sm">
                    <User className="mr-2 h-3 w-3" />
                    View Profile
                  </Button>
                </div>
                
                {/* Admin Actions */}
                {isAdmin && member.email !== "sadiq.rasheed@outlook.com" && member.id !== "249ed938-df8c-41f2-9a3c-bc511fe68b94" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {showBanConfirm === member.id ? (
                      <div className="space-y-2">
                        <div className="text-sm text-destructive font-medium text-center">
                          Are you sure? This will permanently delete the user and all their content.
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleBanUser(member.id, member.full_name || member.email)}
                            disabled={banningUserId === member.id}
                            className="flex-1"
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
                            className="flex-1"
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
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "No members found" : "No members yet"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? "Try adjusting your search terms or check for typos." 
                : "Be the first to join the Mahmood Ihsan Foundation community!"
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}

                 {/* Stats Footer */}
         {members.length > 0 && (
           <div className="border-t border-border pt-6">
             <div className="flex flex-wrap justify-center gap-6 text-center">
               <div>
                 <div className="text-2xl font-bold text-foreground">{members.length}</div>
                 <div className="text-sm text-muted-foreground">Total Members</div>
               </div>
               {members.filter(m => m.phone_number).length > 0 && (
                 <div>
                   <div className="text-2xl font-bold text-foreground">
                     {members.filter(m => m.phone_number).length}
                   </div>
                   <div className="text-sm text-muted-foreground">With Phone Numbers</div>
                 </div>
               )}
               {members.filter(m => m.location).length > 0 && (
                 <div>
                   <div className="text-2xl font-bold text-foreground">
                     {members.filter(m => m.location).length}
                   </div>
                   <div className="text-sm text-muted-foreground">With Locations</div>
                 </div>
               )}
               <div>
                 <div className="text-2xl font-bold text-foreground">
                   {members.filter(m => {
                     const joinDate = new Date(m.created_at)
                     const weekAgo = new Date()
                     weekAgo.setDate(weekAgo.getDate() - 7)
                     return joinDate > weekAgo
                   }).length}
                 </div>
                 <div className="text-sm text-muted-foreground">Joined This Week</div>
               </div>
             </div>
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
