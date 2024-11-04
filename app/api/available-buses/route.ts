import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT b.id, b.bus_number
      FROM buses b
      WHERE NOT EXISTS (
        SELECT 1
        FROM schedules s
        WHERE s.bus_id = b.id
      )
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching available buses:', error)
    return NextResponse.json({ error: 'Failed to fetch available buses' }, { status: 500 })
  }
}