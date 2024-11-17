/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}


export async function authenticateOfficer(username: string, password: string) {
  const result = await query('SELECT * FROM depot_officers WHERE username = $1', [username])
  if (result.rows.length === 0) {
    return null
  }
  const officer = result.rows[0]
  const passwordMatch = await bcrypt.compare(password, officer.password)
  if (!passwordMatch) {
    return null
  }
  // Update last_login timestamp
  await query('UPDATE depot_officers SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [officer.id])
  // Don't send the password hash to the client
  const { password: _, ...officerWithoutPassword } = officer
  return officerWithoutPassword
}