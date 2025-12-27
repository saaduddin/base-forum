"use client"

import { useEffect, useState } from "react"
import { ForumHeader } from "@/components/forum-header"
import { ThreadCard } from "@/components/thread-card"
import { CreateThreadDialog } from "@/components/create-thread-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filter, setFilter] = useState("latest")
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const loadThreads = async (cursor?: string, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    try {
      const data = await ForumAPI.getThreads({ filter, limit: 7, ...(cursor && { cursor }) })
      console.log('API Response:', data)
      console.log('Next Cursor:', data.nextThreadCursor)
      const newThreads = data.threads || []
      if (append) {
        setThreads(prev => [...prev, ...newThreads])
      } else {
        setThreads(newThreads)
      }
      setNextCursor(data.nextThreadCursor || null)
    } catch (error) {
      console.error("Failed to load threads:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (nextCursor) {
      loadThreads(nextCursor, true)
    }
  }

  useEffect(() => {
    setNextCursor(null)
    loadThreads(undefined, false)
  }, [filter])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <ForumHeader />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Customer Support/Community Forum</h1>
              <p className="text-muted-foreground">
                A modern, privacy-focused forum solution for customer support and community building.
              </p>
            </div>
            {user && <CreateThreadDialog onSuccess={loadThreads} />}
          </div>

          <div className="mb-6">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No threads yet. Be the first to start a discussion!</p>
              {user && <CreateThreadDialog onSuccess={loadThreads} />}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
              {nextCursor && threads.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
