import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Clock, Eye, Heart, MessageCircle, Plus, ArrowRight } from "lucide-react"
import Image from "next/image"

export default async function BlogPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Mock blog data - in real app, this would come from a blog posts table
  const blogPosts = [
    {
      id: 1,
      title: "Strengthening Family Bonds Through Islamic Values",
      slug: "strengthening-family-bonds-islamic-values",
      excerpt:
        "Discover how Islamic principles can help build stronger, more supportive family relationships in today's modern world. Learn practical ways to implement these values in daily life.",
      author: {
        name: "Imam Yusuf Ibrahim",
        email: "imam.yusuf@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Islamic Teachings",
      publishedAt: "2024-06-20T10:00:00Z",
      readTime: 8,
      views: 1247,
      likes: 89,
      comments: 23,
      featured: true,
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 2,
      title: "Community Health Initiative: Free Medical Checkups Success Story",
      slug: "community-health-initiative-success-story",
      excerpt:
        "Our recent community health drive provided free medical checkups to over 500 families. Read about the impact and how you can get involved in future initiatives.",
      author: {
        name: "Dr. Fatima Hassan",
        email: "dr.fatima@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Healthcare",
      publishedAt: "2024-06-18T14:30:00Z",
      readTime: 6,
      views: 892,
      likes: 67,
      comments: 18,
      featured: false,
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 3,
      title: "Environmental Stewardship: Our Tree Planting Campaign Results",
      slug: "environmental-stewardship-tree-planting-results",
      excerpt:
        "Alhamdulillah! Our environmental initiative has successfully planted over 1,000 trees across three communities. Learn about our ongoing sustainability efforts.",
      author: {
        name: "Yusuf Ibrahim",
        email: "yusuf.ibrahim@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Environment",
      publishedAt: "2024-06-15T09:15:00Z",
      readTime: 5,
      views: 634,
      likes: 45,
      comments: 12,
      featured: false,
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 4,
      title: "Educational Support Program: Scholarship Recipients Announced",
      slug: "educational-support-scholarship-recipients",
      excerpt:
        "We're proud to announce the recipients of our educational scholarship program. Meet the bright young minds who will benefit from community support.",
      author: {
        name: "Omar Abdullah",
        email: "omar.abdullah@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Education",
      publishedAt: "2024-06-12T16:45:00Z",
      readTime: 7,
      views: 756,
      likes: 52,
      comments: 15,
      featured: true,
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 5,
      title: "Ramadan Community Iftar: Building Unity Through Shared Meals",
      slug: "ramadan-community-iftar-building-unity",
      excerpt:
        "Our Ramadan community iftar brought together over 300 families for an evening of unity, reflection, and shared blessings. See highlights from this special event.",
      author: {
        name: "Aisha Mohammed",
        email: "aisha.mohammed@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Community Events",
      publishedAt: "2024-06-10T19:30:00Z",
      readTime: 4,
      views: 1089,
      likes: 78,
      comments: 31,
      featured: false,
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 6,
      title: "Youth Mentorship Program: Empowering the Next Generation",
      slug: "youth-mentorship-program-next-generation",
      excerpt:
        "Our youth mentorship program pairs experienced community members with young people seeking guidance. Learn about the program's impact and how to get involved.",
      author: {
        name: "Zainab Ali",
        email: "zainab.ali@foundation.org",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      category: "Youth Development",
      publishedAt: "2024-06-08T11:20:00Z",
      readTime: 6,
      views: 543,
      likes: 41,
      comments: 9,
      featured: false,
      image: "/placeholder.svg?height=400&width=800",
    },
  ]

  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const userForLayout = {
    id: user.id,
    email: user.email || "",
    user_metadata: user.user_metadata,
  }

  return (
    <DashboardLayout user={userForLayout}>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">Foundation Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Updates, insights, and stories from our community
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-12 h-14 text-lg bg-input border-border rounded-xl"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-xl"
            >
              <Plus className="mr-3 h-5 w-5" />
              Write New Article
            </Button>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <section className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Articles</h2>
              <div className="w-24 h-1 bg-primary rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {featuredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-card border-border overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      width={800}
                      height={400}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
                        Featured
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {post.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatRelativeTime(post.publishedAt)}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-card-foreground mb-4 leading-tight line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed line-clamp-3 text-lg">{post.excerpt}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                          <AvatarFallback className="bg-primary/20 text-primary font-medium">
                            {post.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-card-foreground">{post.author.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}m read</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Latest Articles</h2>
            <div className="w-24 h-1 bg-primary rounded-full"></div>
          </div>

          <div className="space-y-12">
            {regularPosts.map((post) => (
              <Card
                key={post.id}
                className="bg-card border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="px-3 py-1 text-sm">
                        {post.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatRelativeTime(post.publishedAt)}</span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl lg:text-3xl font-bold text-card-foreground leading-tight line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed line-clamp-3 text-lg">{post.excerpt}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                          <AvatarFallback className="bg-primary/20 text-primary font-medium">
                            {post.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-card-foreground">{post.author.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}m</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-medium">
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="text-center mt-16 mb-8">
          <Button variant="outline" size="lg" className="border-border px-8 py-4 text-lg rounded-xl">
            Load More Articles
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
