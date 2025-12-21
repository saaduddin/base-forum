import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    const response = await fetch(`${API_URL}/search?${queryString}`, {
      headers: {
        "x-api-key": API_KEY!,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Search failed" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
