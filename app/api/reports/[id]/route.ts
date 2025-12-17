import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/report/${id}`, {
      headers: {
        "x-api-key": API_KEY || "",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to fetch report", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report", details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_BASE}/report/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to update report", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update report", details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const res = await fetch(`${API_BASE}/report/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": API_KEY || "",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to delete report", details: error }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete report", details: String(error) }, { status: 500 })
  }
}
