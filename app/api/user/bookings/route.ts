import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const userEmail = request.nextUrl.searchParams.get('email')

  if (!userEmail) {
    return NextResponse.json({ error: 'User email is required' }, { status: 400 })
  }

  try {
    const result = await query(`
      SELECT b.id, r.name AS route_name, s.departure, s.arrival, b.seats_booked, b.total_price
      FROM bookings b
      JOIN schedules s ON b.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      JOIN user_accounts ua ON b.passenger_email = ua.email
      WHERE ua.email = $1
      ORDER BY s.departure DESC
    `, [userEmail])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}