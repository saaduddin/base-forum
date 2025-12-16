"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ForumAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

export function CreateThreadDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPoll, setShowPoll] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    pinned: false,
    locked: false,
  })
  const [pollData, setPollData] = useState({
    title: "",
    options: [
      { title: "", color: "#8b5cf6" },
      { title: "", color: "#3b82f6" },
    ],
  })

  const addPollOption = () => {
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]
    setPollData({
      ...pollData,
      options: [...pollData.options, { title: "", color: colors[pollData.options.length % colors.length] }],
    })
  }

  const removePollOption = (index: number) => {
    setPollData({
      ...pollData,
      options: pollData.options.filter((_, i) => i !== index),
    })
  }

  const updatePollOption = (index: number, title: string) => {
    const newOptions = [...pollData.options]
    newOptions[index].title = title
    setPollData({ ...pollData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsLoading(true)
    try {
      const payload: any = { ...formData, tagIds: [] }

      if (showPoll && pollData.title && pollData.options.every((opt) => opt.title)) {
        payload.poll = {
          title: pollData.title,
          options: pollData.options.map((opt) => ({
            title: opt.title,
            color: opt.color,
            extendedData: {},
          })),
        }
      }

      await ForumAPI.createThread(payload, token)
      toast({ title: "Thread created!", description: "Your thread has been posted." })
      setOpen(false)
      setFormData({ title: "", body: "", pinned: false, locked: false })
      setPollData({
        title: "",
        options: [
          { title: "", color: "#8b5cf6" },
          { title: "", color: "#3b82f6" },
        ],
      })
      setShowPoll(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create thread:", error)
      toast({
        title: "Failed to create thread",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>Share your thoughts and start a discussion with the community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your thread about?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Content</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Describe your thread in detail... (Markdown supported)"
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Poll (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowPoll(!showPoll)}>
                {showPoll ? "Remove Poll" : "Add Poll"}
              </Button>
            </div>

            {showPoll && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="poll-title">Poll Question</Label>
                    <Input
                      id="poll-title"
                      value={pollData.title}
                      onChange={(e) => setPollData({ ...pollData, title: e.target.value })}
                      placeholder="What would you like to ask?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options</Label>
                    {pollData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <div
                          className="w-4 h-4 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                        <Input
                          value={option.title}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {pollData.options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removePollOption(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {pollData.options.length < 6 && (
                      <Button type="button" variant="outline" size="sm" onClick={addPollOption}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pinned"
                checked={formData.pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked as boolean })}
              />
              <label
                htmlFor="pinned"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pin thread
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="locked"
                checked={formData.locked}
                onCheckedChange={(checked) => setFormData({ ...formData, locked: checked as boolean })}
              />
              <label
                htmlFor="locked"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lock thread
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
