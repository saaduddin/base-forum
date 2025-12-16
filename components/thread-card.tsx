"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Pin, Lock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Thread {
  id: string
  title: string
  slug: string
  body: string
  locked: boolean
  pinned: boolean
  user: {
    id: string
    username: string
    avatar?: string
  }
  tags?: Array<{ id: string; name: string; color: string }>
  createdAt: string
  Post?: any[] // API returns 'Post' (capital P) as the posts array
  posts?: any[] // Fallback for compatibility
  likes?: Array<{ id: string; userId: string; dislike?: boolean }>
  _count?: {
    Post?: number // API may return _count.Post
    posts?: number
  }
}

export function ThreadCard({ thread }: { thread: Thread }) {
  const postsCount = thread._count?.Post || thread._count?.posts || thread.Post?.length || thread.posts?.length || 0
  const likesCount = thread.likes?.filter((l) => !l.dislike).length || 0

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {thread.pinned && <Pin className="h-4 w-4 text-primary" />}
              {thread.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
              <Link
                href={`/thread/${thread.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors"
              >
                {thread.title}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{thread.body}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color + "20", color: tag.color }}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/user/${thread.user.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={thread.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{thread.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">{thread.user.username}</span>
          </Link>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{postsCount}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="h-4 w-4" />
            <span>{likesCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
