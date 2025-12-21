import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    const response = await fetch(`${API_URL}/thread/${id}/poll/results`, {
      headers: {
        "x-api-key": API_KEY!,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    const data = await response.json()

    if (response.status === 400 && data.error?.toLowerCase().includes("does not have a poll")) {
      return NextResponse.json(data, { status: response.status })
    }

    if (!response.ok) {
      console.error(
        `[SERVER] fetch to ${API_URL}/thread/${id}/poll/results failed with status ${response.status} and body:`,
        JSON.stringify(data),
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[SERVER] Failed to fetch poll results:", error)
    return NextResponse.json({ error: "Failed to fetch poll results" }, { status: 500 })
  }
}
