import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeId = params.id

    const result = await query(`
      SELECT s.bus_id, s.departure, s.arrival, s.available_seats, b.bus_number,
             json_agg(json_build_object('from_stop', d.from_stop, 'to_stop', d.to_stop, 'distance_km', d.distance_km)) as distances
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      LEFT JOIN distances d ON s.route_id = d.route_id
      WHERE s.route_id = $1
      GROUP BY s.bus_id, s.departure, s.arrival, s.available_seats, b.bus_number
    `, [routeId])

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No assignment found for this route' }, { status: 404 })
    }

    const assignment = result.rows[0]

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching bus assignment:', error)
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch bus assignment' 
    }, { status: 500 })
  }
}