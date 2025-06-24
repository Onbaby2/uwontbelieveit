"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface ActionState {
  success?: string | boolean
  error?: string
  postId?: string
}

// Update the signIn function to handle redirects properly
export async function signIn(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      // Check if it's an email not confirmed error
      if (error.message.includes("Email not confirmed")) {
        return { error: "Please check your email and click the confirmation link to activate your account." }
      }
      return { error: error.message }
    }

    // Return success instead of redirecting directly
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Update the signUp function to handle email confirmation properly
export async function signUp(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phoneNumber = formData.get("phoneNumber")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          firstName: firstName?.toString() || "",
          lastName: lastName?.toString() || "",
          phoneNumber: phoneNumber?.toString() || "",
          full_name: `${firstName?.toString() || ""} ${lastName?.toString() || ""}`.trim(),
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Check if user was created but needs email confirmation
    if (data.user && !data.session) {
      return {
        success: "Account created! Please check your email and click the confirmation link to complete registration.",
      }
    }

    // If we have a session, the user is immediately logged in (email confirmation disabled)
    if (data.session) {
      return { success: "Account created successfully! You can now sign in." }
    }

    return { success: "Account created! Please check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Development helper function to create dev user with admin privileges
export async function createDevUser() {
  if (process.env.NODE_ENV !== "development") {
    return { error: "This function is only available in development" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "sadiq@rasheed.com",
      password: "rasheed123",
    })

    if (!signInError && signInData.session) {
      return { success: true }
    }

    // If sign in fails, try to create the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: "sadiq@rasheed.com",
      password: "rasheed123",
      options: {
        data: {
          firstName: "Sadiq",
          lastName: "Rasheed",
          phoneNumber: "+234 XXX XXX XXXX",
          full_name: "Sadiq Rasheed",
        },
      },
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    // If user was created but needs confirmation, try to confirm manually using service role
    if (signUpData.user && !signUpData.session) {
      // For development, we'll create a confirmed user using SQL
      return { error: "Dev user created but needs email confirmation. Please use the SQL command to confirm the user." }
    }

    return { success: true }
  } catch (error) {
    console.error("Dev user creation error:", error)
    return { error: "Failed to create dev user" }
  }
}

// Function to update user profile
export async function updateUserProfile(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Extract form data
    const firstName = formData.get("firstName")?.toString() || ""
    const lastName = formData.get("lastName")?.toString() || ""
    const phoneNumber = formData.get("phoneNumber")?.toString() || ""
    const location = formData.get("location")?.toString() || ""
    const bio = formData.get("bio")?.toString() || ""
    const avatar = formData.get("avatar") as File

    let avatar_url = user.user_metadata?.avatar_url || ""

    // Handle avatar upload if provided
    if (avatar && avatar.size > 0) {
      // Check file size before upload
      const maxSizeBytes = 1024 * 1024 // 1MB limit
      if (avatar.size > maxSizeBytes) {
        return { error: `Avatar file is too large. Maximum size is 1MB. Current size: ${(avatar.size / (1024 * 1024)).toFixed(2)}MB` }
      }

      const fileExt = avatar.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatar)

      if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return { error: "Failed to upload avatar. Please try again with a smaller image." }
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)
        avatar_url = publicUrl
      }
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        firstName,
        lastName,
        phoneNumber,
        location,
        bio,
        avatar_url,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    })

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: "Profile updated successfully!" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to create a new forum post
export async function createForumPost(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Extract form data
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()
    const category = formData.get("category")?.toString()

    // Validate required fields
    if (!title || !content || !category) {
      return { error: "Title, content, and category are required" }
    }

    // Get user name from metadata
    const firstName = user.user_metadata?.firstName || ""
    const lastName = user.user_metadata?.lastName || ""
    const authorName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Anonymous"

    // Insert forum post
    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        title,
        content,
        category,
        author_id: user.id,
        author_name: authorName,
        author_email: user.email || "",
      })
      .select()
      .single()

    if (error) {
      console.error("Forum post creation error:", error)
      return { error: "Failed to create forum post. Please try again." }
    }

    // Revalidate the forums page to show the new post
    revalidatePath("/dashboard/forums")

    return { success: "Forum post created successfully!", postId: data.id }
  } catch (error) {
    console.error("Forum post creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to increment post views
export async function incrementPostViews(postId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.rpc("increment_post_views", { post_id: postId })

    if (error) {
      console.error("Error incrementing views:", error)
    }
  } catch (error) {
    console.error("Error incrementing views:", error)
  }
}

// Function to toggle post like
export async function togglePostLike(postId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike the post
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)

      // Decrement likes count
      await supabase.rpc("decrement_post_likes", { post_id: postId })
    } else {
      // Like the post
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      })

      // Increment likes count
      await supabase.rpc("increment_post_likes", { post_id: postId })
    }

    revalidatePath("/dashboard/forums")
    return { success: true }
  } catch (error) {
    console.error("Error toggling like:", error)
    return { error: "Failed to update like" }
  }
}

// Function to add a comment to a post
export async function addPostComment(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    const postId = formData.get("postId")?.toString()
    const content = formData.get("content")?.toString()
    const parentId = formData.get("parentId")?.toString() || null

    if (!postId || !content) {
      return { error: "Post ID and content are required" }
    }

    // Get user name from metadata
    const firstName = user.user_metadata?.firstName || ""
    const lastName = user.user_metadata?.lastName || ""
    const authorName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Anonymous"

    // Insert comment
    const { error } = await supabase.from("forum_replies").insert({
      post_id: postId,
      content,
      author_id: user.id,
      author_name: authorName,
      author_email: user.email || "",
      parent_id: parentId,
    })

    if (error) {
      console.error("Comment creation error:", error)
      return { error: "Failed to add comment. Please try again." }
    }

    revalidatePath("/dashboard/forums")
    return { success: "Comment added successfully!" }
  } catch (error) {
    console.error("Comment creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to add a reply to a comment
export async function addCommentReply(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    const postId = formData.get("postId")?.toString()
    const content = formData.get("content")?.toString()
    const parentId = formData.get("parentId")?.toString()

    if (!postId || !content || !parentId) {
      return { error: "Post ID, content, and parent comment ID are required" }
    }

    // Get user name from metadata
    const firstName = user.user_metadata?.firstName || ""
    const lastName = user.user_metadata?.lastName || ""
    const authorName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Anonymous"

    // Insert reply
    const { error } = await supabase.from("forum_replies").insert({
      post_id: postId,
      content,
      author_id: user.id,
      author_name: authorName,
      author_email: user.email || "",
      parent_id: parentId,
    })

    if (error) {
      console.error("Reply creation error:", error)
      return { error: "Failed to add reply. Please try again." }
    }

    revalidatePath("/dashboard/forums")
    return { success: "Reply added successfully!" }
  } catch (error) {
    console.error("Reply creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to delete a forum post (only by the author)
export async function deleteForumPost(postId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // First, check if the post exists and belongs to the current user
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("id, author_id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return { error: "Post not found" }
    }

    // Check if the user is the author of the post
    if (post.author_id !== user.id) {
      return { error: "You can only delete your own posts" }
    }

    // Delete all replies to the post first (due to foreign key constraints)
    const { error: repliesError } = await supabase
      .from("forum_replies")
      .delete()
      .eq("post_id", postId)

    if (repliesError) {
      console.error("Error deleting replies:", repliesError)
      return { error: "Failed to delete post replies" }
    }

    // Delete all likes for the post
    const { error: likesError } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)

    if (likesError) {
      console.error("Error deleting likes:", likesError)
      return { error: "Failed to delete post likes" }
    }

    // Finally, delete the post itself
    const { error: deleteError } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", postId)

    if (deleteError) {
      console.error("Error deleting post:", deleteError)
      return { error: "Failed to delete post" }
    }

    // Revalidate the forums page to show updated data
    revalidatePath("/dashboard/forums")

    return { success: "Post deleted successfully" }
  } catch (error) {
    console.error("Error deleting forum post:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to delete a comment or reply (only by the author)
export async function deleteCommentReply(commentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // First, check if the comment exists and belongs to the current user
    const { data: comment, error: commentError } = await supabase
      .from("forum_replies")
      .select("id, author_id, parent_id")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return { error: "Comment not found" }
    }

    // Check if the user is the author of the comment
    if (comment.author_id !== user.id) {
      return { error: "You can only delete your own comments" }
    }

    // Delete the comment (cascade will handle child replies due to ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("forum_replies")
      .delete()
      .eq("id", commentId)

    if (deleteError) {
      console.error("Error deleting comment:", deleteError)
      return { error: "Failed to delete comment" }
    }

    // Revalidate the forums page to show updated data
    revalidatePath("/dashboard/forums")

    return { success: "Comment deleted successfully" }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to ban a user (admin only)
export async function banUser(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Check if current user is admin
    if (user.email !== "sadiq.rasheed@outlook.com") {
      return { error: "Only administrators can ban users" }
    }

    // Get the user to be banned
    const { data: userToBan, error: userToBanError } = await supabase.auth.admin.getUserById(userId)
    
    if (userToBanError || !userToBan.user) {
      return { error: "User not found" }
    }

    // Prevent admin from banning themselves
    if (userToBan.user.email === "sadiq.rasheed@outlook.com") {
      return { error: "Cannot ban administrator account" }
    }

    // Delete all forum replies by the user
    const { error: repliesError } = await supabase
      .from("forum_replies")
      .delete()
      .eq("author_id", userId)

    if (repliesError) {
      console.error("Error deleting user replies:", repliesError)
      return { error: "Failed to delete user replies" }
    }

    // Delete all forum posts by the user
    const { error: postsError } = await supabase
      .from("forum_posts")
      .delete()
      .eq("author_id", userId)

    if (postsError) {
      console.error("Error deleting user posts:", postsError)
      return { error: "Failed to delete user posts" }
    }

    // Delete all likes by the user
    const { error: likesError } = await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", userId)

    if (likesError) {
      console.error("Error deleting user likes:", likesError)
      return { error: "Failed to delete user likes" }
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error("Error deleting user profile:", profileError)
      return { error: "Failed to delete user profile" }
    }

    // Finally, delete the user account
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error("Error deleting user account:", deleteUserError)
      return { error: "Failed to delete user account" }
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/members")
    revalidatePath("/dashboard/forums")

    return { success: "User banned successfully" }
  } catch (error) {
    console.error("Ban user error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
