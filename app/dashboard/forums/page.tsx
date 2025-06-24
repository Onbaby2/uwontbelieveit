"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, MessageCircle, Eye, Pin } from "lucide-react"
import Link from "next/link"
import ForumFilterOverlay from "@/components/forum-filter-overlay"
import ForumPostDetail from "@/components/forum-post-detail"
import { supabase } from "@/lib/supabase/client"
import DashboardLayout from "@/components/dashboard-layout"
import { Loading } from "@/components/ui/loading"
import AnimatedHeart from "@/components/animated-heart"
import { togglePostLike } from "@/lib/actions"
import { getUserAvatarUrl, getUserInitials } from "@/lib/utils"
import { ForumPost, ForumReply } from "@/lib/types"

interface Category {
  name: string
  count: number
  value: string
}

export default function ForumsPage() {
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilterOverlay, setShowFilterOverlay] = useState(false)
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
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
  const [likeStates, setLikeStates] = useState<Record<string, { isLiked: boolean; likes: number }>>({})

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        setUser({
          id: user.id,
          email: user.email || "",
          user_metadata: user.user_metadata
        })
      }

      // Fetch forum posts
      const { data: posts, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (postsError) {
        console.error("Error fetching posts:", postsError)
        return
      }

      // Fetch user data for avatars
      const { data: usersResponse, error: usersError } = await supabase.auth.admin.listUsers()
      if (usersError) {
        console.error("Error fetching users:", usersError)
      }

      // Create a map of user data by ID
      const userMap = new Map()
      usersResponse?.users?.forEach((userData: {
        id: string
        user_metadata?: {
          firstName?: string
          lastName?: string
          avatar_url?: string
        }
      }) => {
        userMap.set(userData.id, userData)
      })

      // Fetch replies for each post
      const postIds = posts?.map((post) => post.id) || []
      const { data: replies } = await supabase
        .from("forum_replies")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: true })

      // Group replies by post_id and structure them hierarchically
      const repliesByPost = replies?.reduce((acc, reply) => {
        if (!acc[reply.post_id]) acc[reply.post_id] = []
        acc[reply.post_id].push(reply)
        return acc
      }, {} as Record<string, ForumReply[]>) || {}

      // Structure comments hierarchically (top-level comments and their replies)
      const structuredRepliesByPost = Object.keys(repliesByPost).reduce((acc, postId) => {
        const allReplies = repliesByPost[postId]
        const topLevelComments = allReplies.filter((reply: ForumReply) => !reply.parent_id)
        const nestedReplies = allReplies.filter((reply: ForumReply) => reply.parent_id)

        // Add replies to their parent comments
        const structuredComments = topLevelComments.map((comment: ForumReply) => ({
          ...comment,
          replies: nestedReplies
            .filter((reply: ForumReply) => reply.parent_id === comment.id)
            .map((reply: ForumReply) => ({
              ...reply,
              author_id: reply.author_id // Ensure author_id is included
            }))
        }))

        acc[postId] = structuredComments
        return acc
      }, {} as Record<string, ForumReply[]>)

      // Fetch user likes
      let userLikes: { post_id: string }[] = []
      if (user) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)
        userLikes = likes || []
      }

      // Create user likes set
      const userLikesSet = new Set(userLikes.map((like) => like.post_id))

      // Transform posts
      const transformedPosts: ForumPost[] =
        posts?.map((post) => {
          const userData = userMap.get(post.author_id)
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author_name,
            author_id: post.author_id,
            authorInitials: userData ? getUserInitials(userData) : post.author_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase(),
            authorAvatar: userData ? getUserAvatarUrl(userData) : "/placeholder.svg",
            category: getCategoryLabel(post.category),
            categoryColor: getCategoryColor(post.category),
            time: post.created_at,
            replies: structuredRepliesByPost[post.id] || [],
            views: post.views || 0,
            likes: post.likes || 0,
            isPinned: post.is_pinned || false,
            isLiked: userLikesSet.has(post.id),
          }
        }) || []

      setForumPosts(transformedPosts)

      // Generate categories
      const categoryCount: Record<string, number> = {}
      transformedPosts.forEach((post) => {
        categoryCount[post.category] = (categoryCount[post.category] || 0) + 1
      })

      const generatedCategories: Category[] = [
        { name: "All", count: transformedPosts.length, value: "all" },
        ...Object.entries(categoryCount).map(([name, count]) => ({
          name,
          count,
          value: name.toLowerCase().replace(/\s+/g, "_"),
        })),
      ]

      setCategories(generatedCategories)
    } catch (error) {
      console.error("Error fetching forum data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = forumPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category.toLowerCase().replace(/\s+/g, "_") === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post)
  }

  const handlePostDeleted = (deletedPostId: string) => {
    // Remove the deleted post from local state immediately
    setForumPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId))
    setSelectedPost(null)
  }

  const handleCommentAdded = (postId: string, newComment: ForumReply) => {
    // Update the post's replies count in the forum list
    setForumPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, replies: [...post.replies, newComment] }
          : post
      )
    )
  }

  const handleLike = async (postId: string) => {
    setLikeStates(prev => {
      const prevState = prev[postId] || {}
      const isLiked = prevState.isLiked ?? forumPosts.find(p => p.id === postId)?.isLiked
      const likes = prevState.likes ?? forumPosts.find(p => p.id === postId)?.likes ?? 0
      const newIsLiked = !isLiked
      const newLikes = newIsLiked ? Math.max(0, likes + 1) : Math.max(0, likes - 1)
      return { ...prev, [postId]: { isLiked: newIsLiked, likes: newLikes } }
    })
    try {
      const result = await togglePostLike(postId)
      if (!result.success) {
        setLikeStates(prev => {
          const prevState = prev[postId] || {}
          const isLiked = prevState.isLiked ?? forumPosts.find(p => p.id === postId)?.isLiked
          const likes = prevState.likes ?? forumPosts.find(p => p.id === postId)?.likes ?? 0
          return { ...prev, [postId]: { isLiked: !isLiked, likes } }
        })
      }
    } catch {
      setLikeStates(prev => {
        const prevState = prev[postId] || {}
        const isLiked = prevState.isLiked ?? forumPosts.find(p => p.id === postId)?.isLiked
        const likes = prevState.likes ?? forumPosts.find(p => p.id === postId)?.likes ?? 0
        return { ...prev, [postId]: { isLiked: !isLiked, likes } }
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Forums</h1>
            <p className="text-muted-foreground">Connect, share, and support each other</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/dashboard/forums/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forums..."
              className="pl-10 bg-input border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-border" onClick={() => setShowFilterOverlay(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.value
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-accent/50 text-card-foreground"
                  }`}
                >
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Forum Posts */}
          <div className="lg:col-span-3 space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {searchTerm || selectedCategory !== "all" ? "No posts found" : "No Posts Yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to start a conversation in our community!"}
                  </p>
                  {!searchTerm && selectedCategory === "all" && (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                      <Link href="/dashboard/forums/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Post
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.authorAvatar} alt={post.author} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                          {post.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                          <Badge className={`text-xs ${post.categoryColor}`}>{post.category}</Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{getRelativeTime(post.time)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>by {post.author}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <AnimatedHeart
                                isLiked={likeStates[post.id]?.isLiked ?? post.isLiked}
                                onToggle={() => handleLike(post.id)}
                                size="sm"
                              />
                              <span>{likeStates[post.id]?.likes ?? post.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{post.replies.length}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Filter Overlay */}
        {showFilterOverlay && (
          <ForumFilterOverlay
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onClose={() => setShowFilterOverlay(false)}
          />
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <ForumPostDetail 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            currentUserId={currentUserId}
            onPostDeleted={handlePostDeleted}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Helper functions
function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    medical_aid: "Medical Aid",
    community: "Community",
    education: "Education",
    environment: "Environment",
    islamic_studies: "Islamic Studies",
    support: "Support",
    general_discussion: "General Discussion",
  }
  return categoryMap[category] || category
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    medical_aid: "bg-red-500/20 text-red-400",
    community: "bg-green-500/20 text-green-400",
    education: "bg-blue-500/20 text-blue-400",
    environment: "bg-emerald-500/20 text-emerald-400",
    islamic_studies: "bg-purple-500/20 text-purple-400",
    support: "bg-orange-500/20 text-orange-400",
    general_discussion: "bg-gray-500/20 text-gray-400",
  }
  return colorMap[category] || "bg-gray-500/20 text-gray-400"
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}
