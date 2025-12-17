import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE}/notification/${id}`, {
      headers: {
        "x-api-key": API_KEY!,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to fetch notification" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Get notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE}/notification/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY!,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to delete notification" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Delete notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
