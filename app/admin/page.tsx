"use client"

import { useEffect, useState } from "react"
import { ForumHeader } from "@/components/forum-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Users, MessageSquare, Tag, AlertTriangle, Activity, Webhook } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !token) {
      router.push("/")
      return
    }

    const loadAdminData = async () => {
      setIsLoading(true)
      try {
        const [statsData, reportsData, webhooksData, integrationsData] = await Promise.all([
          ForumAPI.getStats(),
          ForumAPI.getReports(token).catch(() => ({ reports: [] })),
          ForumAPI.getWebhooks(token).catch(() => ({ webhooks: [] })),
          ForumAPI.getIntegrations(token).catch(() => ({ integrations: [] })),
        ])
        setStats(statsData)
        setReports(reportsData.reports || [])
        setWebhooks(webhooksData.webhooks || [])
        setIntegrations(integrationsData.integrations || [])
      } catch (error) {
        console.error("Failed to load admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [user, token])

  const [newTag, setNewTag] = useState({ name: "", description: "", color: "#6366f1" })
  const [newWebhook, setNewWebhook] = useState({ url: "", events: ["thread.created", "post.created"] })

  const handleCreateTag = async () => {
    if (!token) return
    try {
      await ForumAPI.createTag(newTag, token)
      toast({ title: "Tag created!", description: "The new tag is now available." })
      setNewTag({ name: "", description: "", color: "#6366f1" })
    } catch (error) {
      toast({ title: "Failed to create tag", variant: "destructive" })
    }
  }

  const handleCreateWebhook = async () => {
    if (!token) return
    try {
      await ForumAPI.createWebhook(newWebhook, token)
      toast({ title: "Webhook created!", description: "The webhook is now active." })
      setNewWebhook({ url: "", events: ["thread.created", "post.created"] })
    } catch (error) {
      toast({ title: "Failed to create webhook", variant: "destructive" })
    }
  }

  if (!user || !token) return null

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ForumHeader />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your forum and view analytics</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.users || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.threads || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.posts || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs defaultValue="reports" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                  <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        User Reports
                      </CardTitle>
                      <CardDescription>Review and manage user-submitted reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reports.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No reports to review</p>
                      ) : (
                        <div className="space-y-3">
                          {reports.map((report) => (
                            <Card key={report.id}>
                              <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold mb-1">
                                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                                    </p>
                                    <p className="text-sm text-muted-foreground">{report.description}</p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Review
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tags" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Manage Tags
                      </CardTitle>
                      <CardDescription>Create and organize forum tags</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tagName">Tag Name</Label>
                            <Input
                              id="tagName"
                              value={newTag.name}
                              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                              placeholder="Technology"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tagDescription">Description</Label>
                            <Input
                              id="tagDescription"
                              value={newTag.description}
                              onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                              placeholder="Tech discussions"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tagColor">Color</Label>
                            <Input
                              id="tagColor"
                              type="color"
                              value={newTag.color}
                              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleCreateTag}>Create Tag</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhooks
                      </CardTitle>
                      <CardDescription>Configure webhook integrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input
                            id="webhookUrl"
                            value={newWebhook.url}
                            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                            placeholder="https://your-server.com/webhook"
                          />
                        </div>
                        <Button onClick={handleCreateWebhook}>Create Webhook</Button>

                        {webhooks.length > 0 && (
                          <div className="mt-6">
                            <h3 className="font-semibold mb-3">Active Webhooks</h3>
                            <div className="space-y-2">
                              {webhooks.map((webhook) => (
                                <Card key={webhook.id}>
                                  <CardContent className="py-3">
                                    <p className="text-sm font-mono">{webhook.url}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Third-Party Integrations</CardTitle>
                      <CardDescription>Manage external service connections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {integrations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No integrations configured. Connect Slack, Discord, and more.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {integrations.map((integration) => (
                            <Card key={integration.id}>
                              <CardContent className="py-3 flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.type}</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  Configure
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
