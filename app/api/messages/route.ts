import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/private-messages`, {
      headers: {
        "x-api-key": API_KEY!,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let error

      if (contentType?.includes("application/json")) {
        error = await response.json()
      } else {
        error = await response.text()
      }

      console.error("[v0] Messages API error:", response.status, error)
      return NextResponse.json({ error: "Failed to fetch messages", details: error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Messages API error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${API_URL}/private-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let error

      if (contentType?.includes("application/json")) {
        error = await response.json()
      } else {
        error = await response.text()
      }

      return NextResponse.json({ error: "Failed to send message", details: error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
