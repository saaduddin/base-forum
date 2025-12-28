import { type NextRequest, NextResponse } from "next/server"

import { getServerForumClient } from "@/lib/forum-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    console.log('Users API params:', Object.fromEntries(searchParams.entries()))

    const client = getServerForumClient()
    const data = await client.users.list({
      ...(searchParams.get("search") && { query: searchParams.get("search")! }),
      ...(searchParams.get("cursor") && { cursor: searchParams.get("cursor")! }),
      ...(searchParams.get("limit") && { limit: parseInt(searchParams.get("limit")!) }),
      ...(searchParams.get("filter") && { filter: searchParams.get("filter")! as 'newest' | 'oldest' }),
    })
    console.log('Users API response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: "Failed to fetch users", details: String(error) }, { status: 500 })
  }
}
