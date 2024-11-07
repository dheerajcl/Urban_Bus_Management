import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const { username, email, password } = await request.json()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await query(
      'INSERT INTO user_accounts (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    )
    const newUser = result.rows[0]
    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}