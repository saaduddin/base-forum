import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    const response = await fetch(`https://foru.ms/api/v1/thread/${id}/poll/results`, {
      headers: {
        "x-api-key": process.env.FORUM_API_KEY || "",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch poll results" }, { status: 500 })
  }
}
