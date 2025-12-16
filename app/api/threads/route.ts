import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get("filter") || searchParams.get("sort") || "latest"
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "20"
    const tagId = searchParams.get("tagId")
    const userId = searchParams.get("userId")
    const pinned = searchParams.get("pinned")

    const params = new URLSearchParams({
      filter,
      page,
      limit,
    })

    if (tagId) params.append("tagId", tagId)
    if (userId) params.append("userId", userId)
    if (pinned) params.append("pinned", pinned)

    const res = await fetch(`${API_BASE}/threads?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("[v0] Threads API error:", res.status, error)
      return NextResponse.json({ error: "Failed to fetch threads", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
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

    const res = await fetch(`${API_BASE}/thread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const responseText = await res.text()

    if (!res.ok) {
      console.error(`[SERVER] fetch to ${API_BASE}/thread failed with status ${res.status} and body: ${responseText}`)
      return NextResponse.json({ error: "Failed to create thread", details: responseText }, { status: res.status })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[SERVER] Create thread API exception:", error)
    return NextResponse.json({ error: "Failed to create thread", details: String(error) }, { status: 500 })
  }
}
