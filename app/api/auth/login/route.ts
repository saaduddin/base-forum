import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.FORU_MS_API_URL
const API_KEY = process.env.FORU_MS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("[v0] Login API error:", res.status, error)
      return NextResponse.json({ error: "Login failed", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Login API exception:", error)
    return NextResponse.json({ error: "Login failed", details: String(error) }, { status: 500 })
  }
}
