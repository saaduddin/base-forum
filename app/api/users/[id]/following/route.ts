import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const cursor = searchParams.get("cursor")
    const filter = searchParams.get("filter")

    const url = new URL(`${API_URL}/user/${id}/following`)
    if (query) url.searchParams.set("query", query)
    if (cursor) url.searchParams.set("cursor", cursor)
    if (filter) url.searchParams.set("filter", filter)

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to fetch following", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch following", details: String(error) }, { status: 500 })
  }
}
