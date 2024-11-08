import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const route_id = params.id

  try {
    const result = await query(`
      SELECT s.bus_id, s.departure_date, s.departure_time, s.arrival_date, s.arrival_time, s.price, s.available_seats,
             json_agg(json_build_object('from_stop', d.from_stop, 'to_stop', d.to_stop, 'distance_km', d.distance_km)) as distances
      FROM schedules s
      LEFT JOIN distances d ON s.route_id = d.route_id
      WHERE s.route_id = $1
      GROUP BY s.id, s.bus_id, s.departure_date, s.departure_time, s.arrival_date, s.arrival_time, s.price, s.available_seats
    `, [route_id])

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Bus assignment not found' }, { status: 404 })
    }

    const assignment = result.rows[0]
    return NextResponse.json({
      bus_id: assignment.bus_id,
      departure_date: assignment.departure_date,
      departure_time: assignment.departure_time,
      arrival_date: assignment.arrival_date,
      arrival_time: assignment.arrival_time,
      price: assignment.price,
      available_seats: assignment.available_seats,
      distances: assignment.distances
    })
  } catch (error) {
    console.error('Error fetching bus assignment:', error)
    return NextResponse.json({ message: 'Failed to fetch bus assignment' }, { status: 500 })
  }
}