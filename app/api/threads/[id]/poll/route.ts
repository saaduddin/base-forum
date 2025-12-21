import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const response = await fetch(`${API_URL}/thread/${id}/poll`, {
      headers: {
        "x-api-key": API_KEY!,
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
