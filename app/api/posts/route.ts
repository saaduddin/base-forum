import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORUM_API_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = new URLSearchParams()

    if (searchParams.get("threadId")) params.append("threadId", searchParams.get("threadId")!)
    if (searchParams.get("userId")) params.append("userId", searchParams.get("userId")!)
    if (searchParams.get("page")) params.append("page", searchParams.get("page")!)
    if (searchParams.get("limit")) params.append("limit", searchParams.get("limit")!)

    const res = await fetch(`${API_BASE}/posts?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to fetch posts", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_BASE}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to create post", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create post", details: String(error) }, { status: 500 })
  }
}
