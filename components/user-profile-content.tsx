"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThreadCard } from "@/components/thread-card"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageSquare, Mail, Calendar, UserPlus, UserMinus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function UserProfileContent({ userId }: { userId: string }) {
  const { user: currentUser, token } = useAuth()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    setIsLoading(true)
    try {
      const userData = await ForumAPI.getUser(userId).catch((err) => {
        console.error("Failed to load user:", err)
        throw new Error("Failed to fetch user")
      })

      const threadsData = await ForumAPI.getThreads({ userId, limit: 20 }).catch(() => ({ threads: [] }))

      const followersData = await ForumAPI.getUserFollowers(userId).catch(() => ({ followers: [] }))

      const followingData = await ForumAPI.getUserFollowing(userId).catch(() => ({ following: [] }))

      setUser(userData)
      setThreads(threadsData.threads || [])
      setFollowers(followersData.followers || [])
      setFollowing(followingData.following || [])

      if (currentUser) {
        const isCurrentlyFollowing = followersData.followers?.some((f: any) => f.followerId === currentUser.id)
        setIsFollowing(isCurrentlyFollowing)
      }
    } catch (error) {
      toast({
        title: "Failed to load user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!token) return

    try {
      if (isFollowing) {
        await ForumAPI.unfollowUser(userId, token)
        toast({ title: "Unfollowed user" })
      } else {
        await ForumAPI.followUser(userId, token)
        toast({ title: "Now following user" })
      }
      setIsFollowing(!isFollowing)
      loadUser()
    } catch (error) {
      toast({ title: "Failed to update follow status", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">User not found</p>
          </div>
        </main>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                      </div>
                      <span>{followers.length} followers</span>
                      <span>{following.length} following</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentUser && !isOwnProfile && (
                    <>
                      <Button onClick={handleFollowToggle} variant={isFollowing ? "outline" : "default"}>
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                      <Button variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            {user.bio && (
              <CardContent>
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            )}
          </Card>

          <Tabs defaultValue="threads" className="w-full">
            <TabsList>
              <TabsTrigger value="threads">
                <MessageSquare className="h-4 w-4 mr-2" />
                Threads
              </TabsTrigger>
              <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
              <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="threads" className="space-y-4 mt-6">
              {threads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No threads yet</p>
                </div>
              ) : (
                threads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)
              )}
            </TabsContent>
            <TabsContent value="followers" className="mt-6">
              <div className="grid gap-4">
                {followers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No followers yet</p>
                  </div>
                ) : (
                  followers.map((follower: any) => (
                    <Card key={follower.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={follower.follower?.image || "/placeholder.svg"} />
                            <AvatarFallback>{follower.follower?.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {follower.follower?.displayName || follower.follower?.username}
                            </p>
                            <p className="text-sm text-muted-foreground">@{follower.follower?.username}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="following" className="mt-6">
              <div className="grid gap-4">
                {following.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Not following anyone yet</p>
                  </div>
                ) : (
                  following.map((follow: any) => (
                    <Card key={follow.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={follow.following?.image || "/placeholder.svg"} />
                            <AvatarFallback>{follow.following?.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {follow.following?.displayName || follow.following?.username}
                            </p>
                            <p className="text-sm text-muted-foreground">@{follow.following?.username}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
