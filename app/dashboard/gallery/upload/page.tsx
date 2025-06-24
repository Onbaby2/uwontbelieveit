import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, ImageIcon } from "lucide-react"
import Link from "next/link"

export default async function UploadGalleryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const categories = ["Events", "Environment", "Education", "Medical Aid", "Islamic Studies", "Community", "General"]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/gallery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Upload to Gallery</h1>
            <p className="text-muted-foreground">Share photos and memories with the community</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border max-w-4xl">
          <CardHeader>
            <CardTitle className="text-card-foreground">Upload New Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="photo" className="block text-sm font-medium text-foreground">
                  Select Photo *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <Input id="photo" name="photo" type="file" accept="image/*" required className="hidden" />
                  <Button type="button" variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    Photo Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter photo title..."
                    required
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-foreground">
                    Category *
                  </label>
                  <Select name="category" required>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your photo..."
                  rows={4}
                  className="bg-input border-border text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Please ensure your photos follow our community guidelines.
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/dashboard/gallery">Cancel</Link>
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
