"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Reply, Send, Loader2, ChevronDown, ChevronRight, MoreVertical, Trash2, Ban } from "lucide-react"
import { addCommentReply, deleteCommentReply, banUser } from "@/lib/actions"
import { supabase } from "@/lib/supabase/client"

interface Comment {
  id: string
  content: string
  author_name: string
  author_id?: string
  created_at: string
  parent_id?: string | null
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUserId: string
  onReplyAdded: (parentId: string, newReply: Comment) => void
  onCommentDeleted?: (commentId: string) => void
  level?: number
}

function ReplySubmitButton() {
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
          Reply
        </>
      )}
    </Button>
  )
}

export default function CommentItem({ comment, postId, currentUserId, onReplyAdded, onCommentDeleted, level = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [replyState, replyAction] = useActionState(addCommentReply, null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteState, setDeleteState] = useState<{ success?: string; error?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(user?.email === "sadiq.rasheed@outlook.com")
    }
    checkAdminStatus()
  }, [])

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleString()
    } catch {
      return timeString
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setDeleteState(null)

    try {
      const result = await deleteCommentReply(comment.id)
      if (result.success) {
        setDeleteState({ success: result.success })
        // Call the callback to remove the comment from the parent component's state
        if (onCommentDeleted) {
          onCommentDeleted(comment.id)
        }
      } else {
        setDeleteState({ error: result.error })
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      setDeleteState({ error: "An unexpected error occurred" })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleNestedCommentDeleted = (deletedCommentId: string) => {
    // Remove the deleted comment from the current comment's replies
    if (comment.replies) {
      const updatedReplies = comment.replies.filter(reply => reply.id !== deletedCommentId)
      // Update the comment's replies
      comment.replies = updatedReplies
    }
    // Call the parent's deletion handler
    if (onCommentDeleted) {
      onCommentDeleted(deletedCommentId)
    }
  }

  const handleReplySubmit = () => {
    if (replyState?.success) {
      // Create a new reply object
      const newReply: Comment = {
        id: Date.now().toString(),
        content: replyContent,
        author_name: "You",
        author_id: currentUserId,
        created_at: new Date().toISOString(),
        parent_id: comment.id,
        replies: []
      }

      // Add the reply to the parent comment
      onReplyAdded(comment.id, newReply)

      // Clear the form and hide it
      setReplyContent("")
      setShowReplyForm(false)
    }
  }

  // Handle reply submission success
  if (replyState?.success && replyContent) {
    handleReplySubmit()
  }

  const hasReplies = comment.replies && comment.replies.length > 0
  const maxLevel = 3 // Maximum nesting level
  const canReply = level < maxLevel
  const canDelete = comment.author_id === currentUserId

  const handleBanUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      alert("Only administrators can ban users.")
      return
    }

    if (!confirm(`Are you sure you want to ban ${userName}? This will permanently delete their account and all their content.`)) {
      return
    }

    try {
      const result = await banUser(userId)
      
      if (result.success) {
        alert(`${userName} has been banned successfully.`)
        // The page will refresh to reflect the changes
        window.location.reload()
      } else {
        alert(`Failed to ban user: ${result.error}`)
      }
    } catch (error) {
      console.error("Error banning user:", error)
      alert("An unexpected error occurred while banning the user.")
    }
  }

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-border/30 pl-4 mt-3' : 'mb-4'}`}>
      <div className="flex items-start space-x-3 group">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {comment.author_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-card-foreground text-sm">{comment.author_name || "Anonymous"}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTime(comment.created_at)}</span>
            </div>
            
            {/* 3-dots menu for comment actions */}
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </>
                    )}
                  </DropdownMenuItem>

                  {/* Ban user option for admin */}
                  {isAdmin && comment.author_id !== currentUserId && comment.author_id && comment.author_name && (
                    <DropdownMenuItem 
                      onClick={() => handleBanUser(comment.author_id!, comment.author_name!)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Ban User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm text-card-foreground leading-relaxed mb-2">{comment.content}</p>
          
          {/* Delete State Messages */}
          {deleteState?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded text-sm mb-2">
              {deleteState.error}
            </div>
          )}

          {deleteState?.success && (
            <div className="bg-primary/10 border border-primary/50 text-primary px-3 py-2 rounded text-sm mb-2">
              {deleteState.success}
            </div>
          )}

          {/* Comment Actions */}
          <div className="flex items-center space-x-2">
            {/* View Replies Button */}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
              >
                {showReplies ? (
                  <>
                    <ChevronDown className="mr-1 h-3 w-3" />
                    Hide {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronRight className="mr-1 h-3 w-3" />
                    Show {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}

            {/* Reply Button */}
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs opacity-100 group-hover:opacity-100 transition-opacity"
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && canReply && (
            <div className="mt-3 space-y-3">
              <form action={replyAction} className="space-y-3">
                <input type="hidden" name="postId" value={postId} />
                <input type="hidden" name="parentId" value={comment.id} />

                {replyState?.error && (
                  <div className="bg-destructive/10 border border-destructive/50 text-destructive px-3 py-2 rounded text-sm">
                    {replyState.error}
                  </div>
                )}

                <Textarea
                  name="content"
                  placeholder="Write your reply..."
                  rows={2}
                  className="bg-background border-border text-foreground resize-none text-sm"
                  required
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false)
                      setReplyContent("")
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <ReplySubmitButton />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && (
        <div className="mt-3">
          {showReplies && (
            <div className="space-y-0">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  onReplyAdded={onReplyAdded}
                  onCommentDeleted={handleNestedCommentDeleted}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 