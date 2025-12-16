import { Navbar } from "@/components/navbar"
import { ThreadContent } from "@/components/thread-content"

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ThreadContent threadId={id} />
    </div>
  )
}
