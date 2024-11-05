import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { busId, seats, email, name } = await request.json()

  try {
    const result = await query('SELECT available_seats FROM schedules WHERE id = $1', [busId])
    const availableSeats = result.rows[0]?.available_seats

    if (availableSeats < seats) {
      return NextResponse.json({ error: 'Not enough available seats' }, { status: 400 })
    }

    await query('UPDATE schedules SET available_seats = available_seats - $1 WHERE id = $2', [seats, busId])
    await query('INSERT INTO bookings (schedule_id, passenger_name, passenger_email, seats_booked) VALUES ($1, $2, $3, $4)', [busId, name, email, seats])

    return NextResponse.json({ message: 'Booking successful' })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}