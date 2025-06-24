"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, MessageCircle, Eye, Send, Loader2, Pin, Trash2, Ban } from "lucide-react"
import { togglePostLike, addPostComment, incrementPostViews, deleteForumPost, banUser } from "@/lib/actions"
import CommentItem from "@/components/comment-item"
import AnimatedHeart from "@/components/animated-heart"
import { supabase } from "@/lib/supabase/client"
import { ForumPost, ForumReply } from "@/lib/types"

interface ForumPostDetailProps {
  post: ForumPost
  onClose: () => void
  currentUserId: string
  onPostDeleted: (deletedPostId: string) => void
  onCommentAdded?: (postId: string, newComment: ForumReply) => void
}

function CommentSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      size="sm"
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-3 w-3" />
          Post Comment
        </>
      )}
    </Button>
  )
}

export default function ForumPostDetail({ post, onClose, currentUserId, onPostDeleted, onCommentAdded }: ForumPostDetailProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [viewsCount, setViewsCount] = useState(post.views)
  const [commentState, commentAction] = useActionState(addPostComment, null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteState, setDeleteState] = useState<{ success?: string; error?: string } | null>(null)
  const [comments, setComments] = useState(post.replies)
  const [commentContent, setCommentContent] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [banningUserId, setBanningUserId] = useState<string | null>(null)

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(user?.email === "sadiq.rasheed@outlook.com")
    }
    checkAdminStatus()
  }, [])

  // Increment views when modal opens
  useEffect(() => {
    incrementPostViews(post.id)
    setViewsCount((prev) => prev + 1)
  }, [post.id])

  // Reset comment form on successful submission
  useEffect(() => {
    if (commentState?.success) {
      // Create a new comment object to add to the list
      const newComment = {
        id: Date.now().toString(), // Temporary ID
        content: commentContent,
        author_name: "You", // Will be replaced with actual user name
        created_at: new Date().toISOString(),
        post_id: post.id,
        author_id: currentUserId,
        replies: []
      }
      
      // Add the new comment to the local state
      setComments(prev => [...prev, newComment])
      
      // Clear the comment form
      setCommentContent("")
      
      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded(post.id, newComment)
      }
    }
  }, [commentState?.success, commentContent, currentUserId, onCommentAdded, post.id])

  const handleLike = async () => {
    // Optimistic update - update UI immediately
    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? Math.max(0, likesCount + 1) : Math.max(0, likesCount - 1)
    
    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      const result = await togglePostLike(post.id)
      if (!result.success) {
        // Revert optimistic update on error
        setIsLiked(!newIsLiked)
        setLikesCount(likesCount)
        console.error("Error toggling like:", result.error)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      console.error("Error toggling like:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setDeleteState(null)

    try {
      const result = await deleteForumPost(post.id)
      if (result.success) {
        setDeleteState({ success: result.success })
        // Call the callback to remove the post from the parent component's state
        onPostDeleted(post.id)
        // Close the modal after a short delay
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setDeleteState({ error: result.error })
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      setDeleteState({ error: "An unexpected error occurred" })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReplyAdded = (parentId: string, newReply: ForumReply) => {
    // Add the reply to the appropriate comment
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        }
        return comment
      })
    )
  }

  const handleCommentDeleted = (commentId: string) => {
    // Remove the deleted comment from the local state
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleString()
    } catch {
      return timeString
    }
  }

  const handleBanUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      alert("Only administrators can ban users.")
      return
    }

    if (!confirm(`Are you sure you want to ban ${userName}? This will permanently delete their account and all their content.`)) {
      return
    }

    setBanningUserId(userId)

    try {
      const result = await banUser(userId)
      
      if (result.success) {
        alert(`${userName} has been banned successfully.`)
        // Close the modal since the user has been banned
        onClose()
      } else {
        alert(`Failed to ban user: ${result.error}`)
      }
    } catch (error) {
      console.error("Error banning user:", error)
      alert("An unexpected error occurred while banning the user.")
    } finally {
      setBanningUserId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorAvatar} alt={post.author} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                {post.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">{post.author}</h2>
              <p className="text-sm text-muted-foreground">{formatTime(post.time)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Post Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
              <Badge className={`text-xs ${post.categoryColor}`}>{post.category}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">{post.title}</h1>
          </div>

          {/* Post Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between py-4 border-y border-border">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <AnimatedHeart 
                  isLiked={isLiked} 
                  onToggle={handleLike}
                  size="md"
                />
                <span className="text-sm text-muted-foreground">{likesCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{viewsCount}</span>
              </div>
            </div>
            
            {/* Delete Button - Only show for post author */}
            {currentUserId === post.author_id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </>
                )}
              </Button>
            )}

            {/* Ban User Button - Only show for admin */}
            {isAdmin && post.author_id !== currentUserId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBanUser(post.author_id, post.author)}
                disabled={banningUserId === post.author_id}
              >
                {banningUserId === post.author_id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Banning...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Ban User
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Delete State Messages */}
          {deleteState?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
              {deleteState.error}
            </div>
          )}

          {deleteState?.success && (
            <div className="bg-primary/10 border border-primary/50 text-primary px-4 py-3 rounded-lg">
              {deleteState.success}
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-card-foreground">Comments ({comments.length})</h3>

            {/* Add Comment Form */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <form action={commentAction} className="space-y-4">
                <input type="hidden" name="postId" value={post.id} />

                {commentState?.error && (
                  <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded text-sm">
                    {commentState.error}
                  </div>
                )}

                {commentState?.success && (
                  <div className="bg-primary/10 border border-primary/50 text-primary px-3 py-2 rounded text-sm">
                    {commentState.success}
                  </div>
                )}

                <Textarea
                  name="content"
                  placeholder="Write your comment..."
                  rows={3}
                  className="bg-background border-border text-foreground resize-none"
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <CommentSubmitButton />
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-0">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((reply, index) => (
                  <CommentItem 
                    key={reply.id || index} 
                    comment={reply} 
                    postId={post.id}
                    currentUserId={currentUserId}
                    onReplyAdded={handleReplyAdded}
                    onCommentDeleted={handleCommentDeleted}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
