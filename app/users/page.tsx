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
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const data = await ForumAPI.getUsers({ search, limit: 50 })
        setUsers(data.users || [])
      } catch (error) {
        console.error("Failed to load users:", error)
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <ForumHeader />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Members</h1>
            <p className="text-muted-foreground mb-4">Connect with other forum members</p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <Link key={user.id} href={`/user/${user.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image || "/placeholder.svg"} />
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
          )}
        </div>
      </main>
    </div>
  )
}
