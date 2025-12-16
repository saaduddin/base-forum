"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ForumAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

interface PollWidgetProps {
  threadId: string
}

export function PollWidget({ threadId }: PollWidgetProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [pollResults, setPollResults] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    loadPollResults()
  }, [threadId])

  const loadPollResults = async () => {
    try {
      const results = await ForumAPI.getPollResults(threadId, token)
      setPollResults(results)

      // Check if user has already voted
      if (results.userVote) {
        setHasVoted(true)
        setSelectedOption(results.userVote.optionId)
      }
    } catch (error) {
      console.error("Failed to load poll results:", error)
    }
  }

  const handleVote = async () => {
    if (!token || !selectedOption) return

    setIsVoting(true)
    try {
      if (hasVoted) {
        await ForumAPI.updatePollVote(threadId, selectedOption, token)
        toast({ title: "Vote updated!" })
      } else {
        await ForumAPI.votePoll(threadId, selectedOption, token)
        toast({ title: "Vote cast!" })
      }
      setHasVoted(true)
      loadPollResults()
    } catch (error) {
      toast({ title: "Failed to vote", variant: "destructive" })
    } finally {
      setIsVoting(false)
    }
  }

  const handleChangeVote = async () => {
    setHasVoted(false)
  }

  if (!pollResults) return null

  const totalVotes = pollResults.options?.reduce((sum: number, opt: any) => sum + (opt._count?.votes || 0), 0) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{pollResults.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasVoted ? (
          <div className="space-y-2">
            {pollResults.options?.map((option: any) => {
              const votes = option._count?.votes || 0
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
              const isSelected = option.id === selectedOption

              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                      <span className="font-medium">{option.title}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: option.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{votes} votes</p>
                </div>
              )
            })}
            <div className="pt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>Total: {totalVotes} votes</span>
              {token && (
                <Button variant="link" size="sm" onClick={handleChangeVote}>
                  Change vote
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {pollResults.options?.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                    {option.title}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleVote} disabled={!selectedOption || isVoting} className="w-full">
              {isVoting ? "Voting..." : "Cast Vote"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
