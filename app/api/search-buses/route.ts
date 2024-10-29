import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const destination = searchParams.get('destination')
  const date = searchParams.get('date')

  try {
    const result = await query(`
      SELECT s.id, b.type, s.price, b.capacity, s.departure_time, s.arrival_time, 
             r.name as route_name, s.available_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      JOIN stops source_stop ON r.id = source_stop.route_id
      JOIN stops dest_stop ON r.id = dest_stop.route_id
      WHERE source_stop.stop_name = $1
        AND dest_stop.stop_name = $2
        AND source_stop.stop_order < dest_stop.stop_order
        AND DATE(s.departure_time) = $3
      ORDER BY s.departure_time
    `, [source, destination, date])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Search buses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}