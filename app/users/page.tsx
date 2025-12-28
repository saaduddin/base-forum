"use client"

import { useEffect, useState } from "react"
import { ForumHeader } from "@/components/forum-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ForumAPI } from "@/lib/api"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const loadUsers = async (searchQuery: string, cursor?: string, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    try {
      const params: any = { limit: 7 }
      if (searchQuery) params.search = searchQuery
      if (cursor) params.cursor = cursor
      
      const data = await ForumAPI.getUsers(params)
      console.log('Users API Response:', data)
      if (append) {
        setUsers(prev => [...prev, ...(data.users || [])])
      } else {
        setUsers(data.users || [])
      }
      setNextCursor(data.nextCursor || null)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (nextCursor) {
      loadUsers(search, nextCursor, true)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search, undefined, false)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <ForumHeader />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Users</h1>
            <p className="text-muted-foreground mb-4">Connect with other forum users</p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Link key={user.id} href={`/user/${user.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image || "/placeholder.svg"} alt={`${user.username} avatar`} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{user.displayName || user.username}</p>
                            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                          </div>
                        </div>
                        {user.bio && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {nextCursor && users.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
