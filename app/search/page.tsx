"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ThreadCard } from "@/components/thread-card"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ForumAPI } from "@/lib/api"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any>({ threads: [], posts: [], users: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!query.trim()) return

    const searchAll = async () => {
      setIsLoading(true)
      try {
        const data = await ForumAPI.search({ q: query, limit: 20 })
        setResults(data.results || { threads: [], posts: [], users: [] })
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(searchAll, 500)
    return () => clearTimeout(timer)
  }, [query])

  const totalResults = (results.threads?.length || 0) + (results.posts?.length || 0) + (results.users?.length || 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Search</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search threads, posts, and users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 text-lg h-12"
                autoFocus
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : query.trim() === "" ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Enter a search query to find threads, posts, and users</p>
              </CardContent>
            </Card>
          ) : totalResults === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
              </p>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                  <TabsTrigger value="threads">Threads ({results.threads?.length || 0})</TabsTrigger>
                  <TabsTrigger value="posts">Posts ({results.posts?.length || 0})</TabsTrigger>
                  <TabsTrigger value="users">Users ({results.users?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-6">
                  {results.threads?.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Threads</h2>
                      <div className="space-y-3">
                        {results.threads.map((thread: any) => (
                          <ThreadCard key={thread.id} thread={thread} />
                        ))}
                      </div>
                    </div>
                  )}

                  {results.users?.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Users</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.users.map((user: any) => (
                          <Link key={user.id} href={`/user/${user.id}`}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                              <CardContent className="py-4 flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.image || "/placeholder.svg"} />
                                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{user.displayName || user.username}</p>
                                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="threads" className="mt-6">
                  <div className="space-y-3">
                    {results.threads?.map((thread: any) => (
                      <ThreadCard key={thread.id} thread={thread} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="posts" className="mt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Post search results coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.users?.map((user: any) => (
                      <Link key={user.id} href={`/user/${user.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="py-4 flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.image || "/placeholder.svg"} />
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{user.displayName || user.username}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
