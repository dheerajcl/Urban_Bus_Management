import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { route_id, bus_id, departure_date, departure_time, arrival_date, arrival_time, price, available_seats, distances } = await request.json()

    // Check if the bus exists and get its details
    const busResult = await query('SELECT id, capacity, bus_number FROM buses WHERE id = $1', [bus_id])
    if (busResult.rows.length === 0) {
      return NextResponse.json({ message: 'Bus not found' }, { status: 404 })
    }
    const { bus_number } = busResult.rows[0]

    // Start a transaction
    await query('BEGIN')

    try {
      // Update the schedules table
      await query(`
        UPDATE schedules
        SET bus_id = $1, departure_date = $2, departure_time = $3, arrival_date = $4, arrival_time = $5, price = $6, available_seats = $7
        WHERE route_id = $8
      `, [bus_id, departure_date, departure_time, arrival_date, arrival_time, price, available_seats, route_id])

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