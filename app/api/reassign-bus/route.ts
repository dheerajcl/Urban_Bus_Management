import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { route_id, bus_id, departure, arrival, available_seats, distances } = await request.json()

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
    await query('BEGIN')

    try {
      // Update the schedules table
      await query(`
        UPDATE schedules
        SET bus_id = $1, departure = $2, arrival = $3, available_seats = $4
        WHERE route_id = $5
      `, [bus_id, departure, arrival, available_seats, route_id])

      // Delete existing distances
      await query('DELETE FROM distances WHERE route_id = $1', [route_id])

      // Insert new distances
      for (const distance of distances) {
        await query(`
          INSERT INTO distances (route_id, from_stop, to_stop, distance_km)
          VALUES ($1, $2, $3, $4)
        `, [route_id, distance.from_stop, distance.to_stop, distance.distance_km])
      }

      // Commit the transaction
      await query('COMMIT')

      return NextResponse.json({ 
        success: true,
        message: 'Bus reassigned successfully',
        bus_number: bus_number
      })
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error reassigning bus:', error)
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Failed to reassign bus' 
    }, { status: 500 })
  }
}