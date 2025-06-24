import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, ImageIcon, BookOpen, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ForumPost {
  id: string
  title: string
  author_name?: string
  created_at: string
  category?: string
}

interface ForumReply {
  id: string
  content: string
  author_name?: string
  created_at: string
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch real analytics data from the database
  let membersCount = 0
  let forumPostsCount = 0
  let forumRepliesCount = 0
  let blogPostsCount = 0
  let recentPosts: ForumPost[] = []
  let recentReplies: ForumReply[] = []

  try {
    // Only fetch data if Supabase is properly configured
    if ('from' in supabase) {
      const [
        { count: members },
        { count: postsCount },
        { count: repliesCount },
        { count: blogCount }
      ] = await Promise.all([
        // Count all users (members)
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        // Count forum posts
        supabase.from("forum_posts").select("*", { count: "exact", head: true }),
        // Count forum replies
        supabase.from("forum_replies").select("*", { count: "exact", head: true }),
        // Count blog posts
        supabase.from("blog_posts").select("*", { count: "exact", head: true })
      ])

      membersCount = members || 0
      forumPostsCount = postsCount || 0
      forumRepliesCount = repliesCount || 0
      blogPostsCount = blogCount || 0

      // Get recent activity data
      const { data: recentPostsData } = await supabase
        .from("forum_posts")
        .select("id, title, author_name, created_at, category")
        .order("created_at", { ascending: false })
        .limit(3)

      const { data: recentRepliesData } = await supabase
        .from("forum_replies")
        .select("id, content, author_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      recentPosts = recentPostsData || []
      recentReplies = recentRepliesData || []
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const userName = user.user_metadata?.firstName || user.email?.split("@")[0] || "User"

  return (
    <DashboardLayout user={{
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata
    }}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Assalamu Alaikum, {userName}</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Active Members</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{membersCount}</div>
              <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Forum Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{forumPostsCount}</div>
              <p className="text-xs text-muted-foreground">Total discussions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Community Replies</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{forumRepliesCount}</div>
              <p className="text-xs text-muted-foreground">Total responses</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Blog Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{blogPostsCount}</div>
              <p className="text-xs text-muted-foreground">Total blog articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Forum Posts */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Latest Forum Posts</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
                  <Link href="/dashboard/forums">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post: ForumPost) => (
                  <Link
                    key={post.id}
                    href="/dashboard/forums"
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{post.author_name?.[0] || "U"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-card-foreground truncate">{post.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{post.author_name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {post.category || "General"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No forum posts yet</p>
                  <p className="text-sm">Be the first to start a discussion!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Updates */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/dashboard/forums/new">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Create Forum Post
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start border-border" asChild>
                  <Link href="/dashboard/gallery/upload">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload to Gallery
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start border-border" asChild>
                  <Link href="/dashboard/members">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Members
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReplies && recentReplies.length > 0 ? (
                  recentReplies.map((reply: ForumReply) => (
                    <div
                      key={reply.id}
                      className="flex items-center space-x-3 hover:bg-accent/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground">New reply by {reply.author_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Foundation Mission */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Heart className="mr-2 h-4 w-4 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Supporting families through Islamic values, providing aid, education, and fostering community unity.
                </p>
                <Button variant="ghost" size="sm" className="mt-3 text-primary hover:text-primary/80 p-0" asChild>
                  <Link href="/dashboard/about">
                    Learn More <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
