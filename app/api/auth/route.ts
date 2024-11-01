import { NextResponse } from 'next/server'
import { authenticateOfficer } from '@/lib/db'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  try {
    const officer = await authenticateOfficer(username, password)
    if (officer) {
      return NextResponse.json({ username: officer.username, role: officer.role })
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}