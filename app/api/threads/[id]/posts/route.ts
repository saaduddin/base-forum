import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORUM_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const queryParams = new URLSearchParams()

    if (searchParams.get("query")) queryParams.append("query", searchParams.get("query")!)
    if (searchParams.get("cursor")) queryParams.append("cursor", searchParams.get("cursor")!)
    if (searchParams.get("filter")) queryParams.append("filter", searchParams.get("filter")!)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    const res = await fetch(`${API_BASE}/thread/${id}/posts${queryString}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      console.error(`[SERVER] Failed to fetch posts for thread ${id}:`, error)
      return NextResponse.json({ error: "Failed to fetch posts", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[SERVER] Error fetching thread posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts", details: String(error) }, { status: 500 })
  }
}
