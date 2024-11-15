import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentBusId = searchParams.get('currentBusId')

    let result;
    if (currentBusId) {
      // If currentBusId is provided, include it in the results along with unassigned buses
      result = await query(`
        SELECT id, bus_number
        FROM buses
        WHERE id = $1
        OR id NOT IN (SELECT DISTINCT bus_id FROM schedules)
        ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, bus_number
      `, [currentBusId])
    } else {
      // If no currentBusId, just fetch unassigned buses
      result = await query(`
        SELECT id, bus_number
        FROM buses
        WHERE id NOT IN (SELECT DISTINCT bus_id FROM schedules)
        ORDER BY bus_number
      `)
    }

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching available buses:', error)
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch available buses' 
    }, { status: 500 })
  }
}