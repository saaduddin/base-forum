"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, MessageSquare, Search, Settings, LogOut, User, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useAuthDialog } from "@/lib/auth-dialog-context"

export function ForumHeader() {
  const { user, logout } = useAuth()
  const { openAuthDialog } = useAuthDialog()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 md:gap-4 text-sm flex-wrap">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Threads
          </Link>
          <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
            Tags
          </Link>
          <Link href="/users" className="text-muted-foreground hover:text-foreground transition-colors">
            Users
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-[200px] pl-8"
            />
          </form>

          {user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || "/placeholder.svg"} alt={`${user.username} avatar`} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.roles?.includes("admin") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={openAuthDialog} size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
