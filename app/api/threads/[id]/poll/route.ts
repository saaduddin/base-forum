import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const apiKey = process.env.FORU_MS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(`https://foru.ms/api/v1/thread/${id}/poll`, {
      headers: {
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json({ error: errorBody }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch poll" }, { status: 500 })
  }
}
