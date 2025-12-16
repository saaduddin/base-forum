import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    const response = await fetch("https://foru.ms/api/v1/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.FORU_MS_API_KEY || "",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
