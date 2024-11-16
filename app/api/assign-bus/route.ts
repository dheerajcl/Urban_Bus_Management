import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { route_id, bus_id, departure, arrival, available_seats } = await request.json()

    const busResult = await query('SELECT id, capacity, bus_number FROM buses WHERE id = $1', [bus_id])
    if (busResult.rows.length === 0) {
      return NextResponse.json({ message: 'Bus not found' }, { status: 404 })
    }

    const departureDate = new Date(departure)
    const arrivalDate = new Date(arrival)
    if (arrivalDate <= departureDate) {
      return NextResponse.json({ 
        message: 'Arrival time must be after departure time' 
      }, { status: 400 })
    }

    if (available_seats > busResult.rows[0].capacity) {
      return NextResponse.json({ 
        message: `Available seats cannot exceed bus capacity (${busResult.rows[0].capacity})` 
      }, { status: 400 })
    }

    const { bus_number } = busResult.rows[0]

    const assignmentCheck = await query('SELECT id FROM schedules WHERE bus_id = $1', [bus_id])
    if (assignmentCheck.rows.length > 0) {
      return NextResponse.json({ message: 'Bus is already assigned to a route' }, { status: 400 })
    }

    await query('BEGIN')

    try {
      const scheduleResult = await query(`
        INSERT INTO schedules (bus_id, route_id, departure, arrival, available_seats)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [bus_id, route_id, departure, arrival, available_seats])

      // Commit the transaction
      await query('COMMIT')
      
      return NextResponse.json({ 
        success: true, 
        schedule_id: scheduleResult.rows[0].id,
        bus_number: bus_number
      })
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error assigning bus:', error)
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Failed to assign bus' 
    }, { status: 500 })
  }
}