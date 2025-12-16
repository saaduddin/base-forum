"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post-card"
import { ReplyForm } from "@/components/reply-form"
import { PollWidget } from "@/components/poll-widget"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, ThumbsUp, ThumbsDown, Lock, Pin, ArrowLeft, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

export function ThreadContent({ threadId }: { threadId: string }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [thread, setThread] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadThread = async () => {
    setIsLoading(true)
    try {
      const [threadData, postsData] = await Promise.all([
        ForumAPI.getThread(threadId),
        ForumAPI.getPosts({ threadId, limit: 100 }),
      ])
      setThread(threadData)
      setPosts(postsData.posts || [])
    } catch (error) {
      console.error("Failed to load thread:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadThread()
  }, [threadId])

  const handleUpvote = async () => {
    if (!token) return
    try {
      await ForumAPI.upvoteThread(threadId, false, token)
      loadThread()
    } catch (error) {
      console.error("Failed to upvote")
    }
  }

  const handleDownvote = async () => {
    if (!token) return
    try {
      await ForumAPI.downvoteThread(threadId, token)
      loadThread()
    } catch (error) {
      console.error("Failed to downvote")
    }
  }

  const handleLike = async () => {
    if (!token) return
    try {
      await ForumAPI.likeThread(threadId, false, token)
      loadThread()
    } catch (error) {
      console.error("Failed to like")
    }
  }

  const handleDislike = async () => {
    if (!token) return
    try {
      await ForumAPI.dislikeThread(threadId, token)
      loadThread()
    } catch (error) {
      console.error("Failed to dislike")
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (!thread) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Thread not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </main>
    )
  }

  const isThreadOwner = user?.id === thread.user?.id

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to threads
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={thread.user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{thread.user?.username?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {thread.pinned && <Pin className="h-4 w-4 text-primary" />}
                  {thread.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <h1 className="text-2xl font-bold">{thread.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{thread.user?.username}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {thread.tags && thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {thread.tags.map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: tag.color + "20", color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap mb-4">{thread.body}</p>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleUpvote}>
                <ThumbsUp className="h-4 w-4 mr-1" />
                {thread._count?.upvotes || 0}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownvote}>
                <ThumbsDown className="h-4 w-4 mr-1" />
                {thread._count?.downvotes || 0}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLike}>
                <Heart className="h-4 w-4 mr-1" />
                {thread._count?.likes || 0}
              </Button>
            </div>
          </CardContent>
        </Card>

        {thread.poll && (
          <div className="mb-6">
            <PollWidget threadId={threadId} />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{posts.length} Replies</h2>

          {user && !thread.locked && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <ReplyForm threadId={threadId} onSuccess={loadThread} />
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={loadThread} isThreadOwner={isThreadOwner} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No replies yet. Be the first to respond!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
