import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  // This is a mock authentication.
  // In a real application, you would validate against a database.
  if (email === 'depot@example.com' && password === 'password') {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ success: false }, { status: 401 })
  }
}