"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, MoreVertical, Flag, CheckCircle, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { ForumAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  body: string
  userId: string
  threadId: string
  parentId?: string
  bestAnswer?: boolean
  user?: {
    id: string
    username: string
    avatar?: string
  }
  createdAt: string
  upvotes?: any[]
  downvotes?: any[]
  likes?: any[]
  dislikes?: any[]
  _count?: {
    upvotes?: number
    downvotes?: number
    likes?: number
    dislikes?: number
  }
}

export function PostCard({
  post,
  onReply,
  onUpdate,
  isThreadOwner = false,
}: {
  post: Post
  onReply?: () => void
  onUpdate?: () => void
  isThreadOwner?: boolean
}) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [isVoting, setIsVoting] = useState(false)

  const handleUpvote = async () => {
    if (!token) return
    setIsVoting(true)
    try {
      await ForumAPI.upvotePost(post.id, false, token)
      onUpdate?.()
    } catch (error) {
      toast({ title: "Failed to upvote", variant: "destructive" })
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownvote = async () => {
    if (!token) return
    setIsVoting(true)
    try {
      await ForumAPI.downvotePost(post.id, token)
      onUpdate?.()
    } catch (error) {
      toast({ title: "Failed to downvote", variant: "destructive" })
    } finally {
      setIsVoting(false)
    }
  }

  const handleLike = async () => {
    if (!token) return
    try {
      await ForumAPI.likePost(post.id, false, token)
      onUpdate?.()
    } catch (error) {
      toast({ title: "Failed to like", variant: "destructive" })
    }
  }

  const handleDislike = async () => {
    if (!token) return
    try {
      await ForumAPI.dislikePost(post.id, token)
      onUpdate?.()
    } catch (error) {
      toast({ title: "Failed to dislike", variant: "destructive" })
    }
  }

  const handleMarkBestAnswer = async () => {
    if (!token) return
    try {
      if (post.bestAnswer) {
        await ForumAPI.unmarkBestAnswer(post.id, token)
        toast({ title: "Removed best answer mark" })
      } else {
        await ForumAPI.markBestAnswer(post.id, token)
        toast({ title: "Marked as best answer!" })
      }
      onUpdate?.()
    } catch (error) {
      toast({ title: "Failed to update best answer", variant: "destructive" })
    }
  }

  const handleReport = async () => {
    if (!token) return
    try {
      await ForumAPI.createReport(
        {
          postId: post.id,
          type: "inappropriate",
          description: "Reported by user",
        },
        token,
      )
      toast({ title: "Post reported", description: "Thank you for keeping our community safe." })
    } catch (error) {
      toast({ title: "Failed to report", variant: "destructive" })
    }
  }

  return (
    <Card className={post.bestAnswer ? "border-primary border-2" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{post.user?.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.bestAnswer && (
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <CheckCircle className="h-4 w-4 fill-primary" />
                Best Answer
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user && <DropdownMenuItem onClick={onReply}>Reply</DropdownMenuItem>}
                {isThreadOwner && (
                  <DropdownMenuItem onClick={handleMarkBestAnswer}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {post.bestAnswer ? "Unmark Best Answer" : "Mark as Best Answer"}
                  </DropdownMenuItem>
                )}
                {user && (
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{post.body}</p>
      </CardContent>
      <CardFooter className="pt-3 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleUpvote} disabled={isVoting}>
          <ThumbsUp className="h-4 w-4 mr-1" />
          {post._count?.upvotes || post.upvotes?.length || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownvote} disabled={isVoting}>
          <ThumbsDown className="h-4 w-4 mr-1" />
          {post._count?.downvotes || post.downvotes?.length || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLike}>
          <Heart className="h-4 w-4 mr-1" />
          {post._count?.likes || post.likes?.length || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDislike}>
          <ThumbsDown className="h-4 w-4 mr-1" />
          {post._count?.dislikes || post.dislikes?.length || 0}
        </Button>
      </CardFooter>
    </Card>
  )
}
