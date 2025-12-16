"use client"

import { useEffect, useState } from "react"
import { ForumHeader } from "@/components/forum-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Plus, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function MessagesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeData, setComposeData] = useState({
    recipientId: "",
    title: "",
    body: "",
  })

  const loadMessages = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await ForumAPI.getPrivateMessages(token)
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !token) {
      router.push("/")
      return
    }
    loadMessages()
  }, [user, token])

  const handleSendMessage = async () => {
    if (!token) return
    try {
      await ForumAPI.sendPrivateMessage(composeData, token)
      toast({ title: "Message sent!", description: "Your message has been delivered." })
      setComposeOpen(false)
      setComposeData({ recipientId: "", title: "", body: "" })
      loadMessages()
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      await ForumAPI.deletePrivateMessage(id, token)
      toast({ title: "Message deleted" })
      setSelectedMessage(null)
      loadMessages()
    } catch (error) {
      toast({ title: "Failed to delete message", variant: "destructive" })
    }
  }

  if (!user || !token) return null

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <ForumHeader />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Private Messages</h1>
              <p className="text-muted-foreground">Your private conversations</p>
            </div>
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientId">Recipient ID</Label>
                    <Input
                      id="recipientId"
                      value={composeData.recipientId}
                      onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Subject</Label>
                    <Input
                      id="title"
                      value={composeData.title}
                      onChange={(e) => setComposeData({ ...composeData, title: e.target.value })}
                      placeholder="Message subject"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      value={composeData.body}
                      onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                      rows={6}
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage}>Send Message</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No messages yet</p>
                <Button onClick={() => setComposeOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Send your first message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                {messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer hover:border-primary/50 transition-colors ${
                      selectedMessage?.id === message.id ? "border-primary" : ""
                    } ${!message.read ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 mb-1">
                        {!message.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                        <p className="font-semibold text-sm truncate">{message.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{selectedMessage.title}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedMessage.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Select a message to view</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
