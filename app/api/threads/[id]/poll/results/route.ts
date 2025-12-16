import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    const response = await fetch(`https://foru.ms/api/v1/thread/${id}/poll/results`, {
      headers: {
        "x-api-key": process.env.FORU_MS_API_KEY || "",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    const data = await response.json()

    if (response.status === 400 && data.error?.toLowerCase().includes("does not have a poll")) {
      return NextResponse.json(data, { status: response.status })
    }

    if (!response.ok) {
      console.error(
        `[SERVER] fetch to https://foru.ms/api/v1/thread/${id}/poll/results failed with status ${response.status} and body:`,
        JSON.stringify(data),
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[SERVER] Failed to fetch poll results:", error)
    return NextResponse.json({ error: "Failed to fetch poll results" }, { status: 500 })
  }
}
