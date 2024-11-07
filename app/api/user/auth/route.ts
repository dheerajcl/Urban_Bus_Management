import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  try {
    const result = await query('SELECT * FROM user_accounts WHERE username = $1', [username])
    const user = result.rows[0]

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { ...userWithoutPassword } = user
      return NextResponse.json({ ...userWithoutPassword, role: 'user' })
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}