import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { busId, routeId, arrival, seats, email, name, pricePerSeat } = await request.json();

  console.log('Received booking request:', { busId, routeId, arrival, seats, email, name, pricePerSeat });

  try {
    const result = await query(
      'SELECT id, available_seats FROM schedules WHERE bus_id = $1 AND route_id = $2 AND arrival = $3',
      [busId, routeId, arrival]
    );
    const schedule = result.rows[0];

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const availableSeats = schedule.available_seats;

    console.log('Available seats before update:', availableSeats);

    if (availableSeats < seats) {
      return NextResponse.json({ error: 'Not enough available seats' }, { status: 400 });
    }

    const totalPrice = pricePerSeat * seats;

    await query('BEGIN');
    await query('UPDATE schedules SET available_seats = available_seats - $1 WHERE id = $2', [seats, schedule.id]);
    const updatedResult = await query('SELECT available_seats FROM schedules WHERE id = $1', [schedule.id]);
    const updatedAvailableSeats = updatedResult.rows[0].available_seats;
    console.log('Available seats after update:', updatedAvailableSeats);
    await query('INSERT INTO bookings (schedule_id, passenger_name, passenger_email, seats_booked, total_price) VALUES ($1, $2, $3, $4, $5)', [schedule.id, name, email, seats, totalPrice]);
    await query('COMMIT');

    return NextResponse.json({ message: 'Booking successful', totalPrice });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}