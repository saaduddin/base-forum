import { type NextRequest, NextResponse } from "next/server"

const API_BASE = "https://foru.ms/api/v1"
const API_KEY = process.env.FORU_MS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = new URLSearchParams()

    if (searchParams.get("page")) params.append("page", searchParams.get("page")!)
    if (searchParams.get("limit")) params.append("limit", searchParams.get("limit")!)
    if (searchParams.get("search")) params.append("search", searchParams.get("search")!)

    const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error: "Failed to fetch users", details: error }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users", details: String(error) }, { status: 500 })
  }
}
