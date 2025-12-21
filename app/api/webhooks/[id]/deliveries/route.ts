import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(`${API_URL}/webhooks/${id}/deliveries`)
    if (cursor) url.searchParams.set("cursor", cursor)

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": API_KEY!,
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch webhook deliveries" }, { status: 500 })
  }
}
