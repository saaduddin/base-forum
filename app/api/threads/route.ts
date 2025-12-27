export const revalidate = 60

import { type NextRequest, NextResponse } from "next/server"

import { getServerForumClient } from "@/lib/forum-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get("filter") || searchParams.get("sort") || "latest"
    const cursor = searchParams.get("cursor")
    const limit = searchParams.get("limit") || "7"
    const tagId = searchParams.get("tagId")
    const userId = searchParams.get("userId")
    const pinned = searchParams.get("pinned")

    const client = getServerForumClient()
    const data = await client.threads.list({
      limit: parseInt(limit),
      filter: filter as 'newest' | 'oldest',
      ...(cursor && { cursor }),
      ...(tagId && { tagId }),
      ...(userId && { userId }),
      ...(pinned && { pinned: pinned === 'true' }),
    })
    return NextResponse.json(data, {
      headers: { "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}` },
    })
  } catch (error) {
    console.error("[v0] Threads API exception:", error)
    return NextResponse.json({ error: "Failed to fetch threads", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const client = getServerForumClient(token)
    const data = await client.threads.create(body)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[SERVER] Create thread API exception:", error)
    return NextResponse.json({ error: "Failed to create thread", details: String(error) }, { status: 500 })
  }
}
