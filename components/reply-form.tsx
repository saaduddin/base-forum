"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { ForumAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ReplyForm({
  threadId,
  parentId,
  onSuccess,
}: {
  threadId: string
  parentId?: string
  onSuccess?: () => void
}) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [body, setBody] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !body.trim()) return

    setIsLoading(true)
    try {
      await ForumAPI.createPost({ body, threadId, parentId }, token)
      toast({ title: "Reply posted!", description: "Your reply has been added." })
      setBody("")
      onSuccess?.()
    } catch (error) {
      toast({ title: "Failed to post reply", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply... (Markdown supported)"
        rows={4}
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading || !body.trim()}>
          {isLoading ? "Posting..." : "Post Reply"}
        </Button>
      </div>
    </form>
  )
}
