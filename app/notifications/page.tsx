"use client"

import { useEffect, useState } from "react"
import { ForumHeader } from "@/components/forum-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Bell, MessageSquare, ThumbsUp, AtSign, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await ForumAPI.getNotifications(token)
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !token) {
      router.push("/")
      return
    }
    loadNotifications()
  }, [user, token])

  const handleMarkRead = async (id: string) => {
    if (!token) return
    try {
      await ForumAPI.markNotificationRead(id, token)
      loadNotifications()
    } catch (error) {
      toast({ title: "Failed to mark as read", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      await ForumAPI.deleteNotification(id, token)
      loadNotifications()
      toast({ title: "Notification deleted" })
    } catch (error) {
      toast({ title: "Failed to delete notification", variant: "destructive" })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <AtSign className="h-5 w-5 text-primary" />
      case "reply":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "like":
      case "upvote":
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (!user || !token) return null

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <ForumHeader />

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your forum activity</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={notification.read ? "opacity-60" : "border-primary/30 bg-primary/5"}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1">
                          <span className="font-semibold">{notification.extendedData?.username || "Someone"}</span>{" "}
                          {notification.type === "mention" && "mentioned you in a post"}
                          {notification.type === "reply" && "replied to your thread"}
                          {notification.type === "like" && "liked your post"}
                          {notification.type === "upvote" && "upvoted your thread"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notification.id)}>
                            Mark Read
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
