import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Upload, Search, Filter, Heart, Download, Share, Calendar, User } from "lucide-react"
import Image from "next/image"

export default async function GalleryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const galleryItems = [
    {
      id: 1,
      title: "Community Iftar 2024",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Aisha Mohammed",
      uploadDate: "2 days ago",
      likes: 45,
      category: "Events",
      description: "Beautiful moments from our community iftar gathering",
    },
    {
      id: 2,
      title: "Tree Planting Initiative",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Omar Abdullah",
      uploadDate: "1 week ago",
      likes: 32,
      category: "Environment",
      description: "Our environmental initiative in action",
    },
    {
      id: 3,
      title: "Children's Education Program",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Fatima Hassan",
      uploadDate: "2 weeks ago",
      likes: 67,
      category: "Education",
      description: "Supporting education for underprivileged children",
    },
    {
      id: 4,
      title: "Medical Aid Distribution",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Ahmad Ali",
      uploadDate: "3 weeks ago",
      likes: 89,
      category: "Medical Aid",
      description: "Providing medical supplies to those in need",
    },
    {
      id: 5,
      title: "Quran Study Circle",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Imam Yusuf",
      uploadDate: "1 month ago",
      likes: 54,
      category: "Islamic Studies",
      description: "Weekly Quran study and discussion sessions",
    },
    {
      id: 6,
      title: "Family Support Meeting",
      image: "/placeholder.svg?height=300&width=400",
      uploadedBy: "Zainab Ali",
      uploadDate: "1 month ago",
      likes: 38,
      category: "Community",
      description: "Monthly family support and counseling sessions",
    },
  ]

  const categories = ["All", "Events", "Environment", "Education", "Medical Aid", "Islamic Studies", "Community"]

  const userForLayout = {
    id: user.id,
    email: user.email || "",
    user_metadata: user.user_metadata,
  }

  return (
    <DashboardLayout user={userForLayout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shared Gallery</h1>
            <p className="text-muted-foreground">Community memories and moments</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search gallery..." className="pl-10 bg-input border-border" />
          </div>
          <Button variant="outline" className="border-border">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/20 transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">{item.category}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>{item.uploadedBy}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{item.uploadDate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Heart className="mr-1 h-4 w-4" />
                    {item.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
