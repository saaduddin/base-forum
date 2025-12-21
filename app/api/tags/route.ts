import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/tags`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to fetch tags", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const body = await request.json()

    const res = await fetch(`${API_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to create tag", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tag", details: String(error) }, { status: 500 })
  }
}
