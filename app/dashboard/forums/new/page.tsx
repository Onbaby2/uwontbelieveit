"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import Link from "next/link"
import { createForumPost } from "@/lib/actions"
import { supabase } from "@/lib/supabase/client"
import DashboardLayout from "@/components/dashboard-layout"
import { Loading } from "@/components/ui/loading"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Publishing...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Publish Post
        </>
      )}
    </Button>
  )
}

export default function NewForumPostPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(createForumPost, null)
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
  const [loading, setLoading] = useState(true)

  const categories = [
    { value: "medical_aid", label: "Medical Aid" },
    { value: "community", label: "Community" },
    { value: "education", label: "Education" },
    { value: "environment", label: "Environment" },
    { value: "islamic_studies", label: "Islamic Studies" },
    { value: "support", label: "Support" },
    { value: "general_discussion", label: "General Discussion" },
  ]

  // Get user data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser({
        id: user.id,
        email: user.email || "",
        user_metadata: user.user_metadata
      })
      setLoading(false)
    }
    getUser()
  }, [router])

  // Redirect on successful post creation
  useEffect(() => {
    if (state?.success && state?.postId) {
      setTimeout(() => {
        router.push("/dashboard/forums")
      }, 1500)
    }
  }, [state, router])

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
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/forums">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forums
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
            <p className="text-muted-foreground">Share your thoughts with the community</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-border max-w-4xl">
          <CardHeader>
            <CardTitle className="text-card-foreground">New Forum Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={formAction} className="space-y-6">
              {state?.error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="bg-primary/10 border border-primary/50 text-primary px-4 py-3 rounded-lg">
                  {state.success} Redirecting to forums...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    Post Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter your post title..."
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
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-foreground">
                  Post Content *
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your post content here..."
                  required
                  rows={12}
                  className="bg-input border-border text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">Please follow our community guidelines when posting.</p>
                <div className="flex space-x-3">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/dashboard/forums">Cancel</Link>
                  </Button>
                  <SubmitButton />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
