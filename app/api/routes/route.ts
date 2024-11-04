import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT r.*, 
             json_agg(DISTINCT jsonb_build_object('id', s.id, 'stop_name', s.stop_name, 'stop_order', s.stop_order)) as stops,
             (SELECT jsonb_build_object(
               'is_assigned', CASE WHEN sch.id IS NOT NULL THEN true ELSE false END,
               'bus_number', b.bus_number,
               'departure_time', sch.departure_time,
               'arrival_time', sch.arrival_time
             )
             FROM schedules sch
             LEFT JOIN buses b ON sch.bus_id = b.id
             WHERE sch.route_id = r.id
             LIMIT 1) as schedule_info
      FROM routes r
      LEFT JOIN stops s ON r.id = s.route_id
      GROUP BY r.id
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const route = await request.json()
    const { name, source, destination, operator_id, stops } = route

    // Start a transaction
    await  query('BEGIN')

    // Insert the route
    const routeResult = await query(
      'INSERT INTO routes (name, source, destination, operator_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, source, destination, operator_id]
    )
    
    const routeId = routeResult.rows[0].id

    // Insert the stops
    for (const stop of stops) {
      await query(
        'INSERT INTO stops (route_id, stop_name, stop_order) VALUES ($1, $2, $3)',
        [routeId, stop.stop_name, stop.stop_order]
      )
    }

    // Commit the transaction
    await query('COMMIT')

    return NextResponse.json({ id: routeId, ...route })
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK')
    console.error('Error adding route:', error)
    return NextResponse.json({ error: 'Failed to add route' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const route = await request.json()
    const { id, name, source, destination, operator_id, stops } = route

    // Start a transaction
    await query('BEGIN')

    // Update the route
    await query(
      'UPDATE routes SET name = $1, source = $2, destination = $3, operator_id = $4 WHERE id = $5',
      [name, source, destination, operator_id, id]
    )

    // Delete existing stops
    await query('DELETE FROM stops WHERE route_id = $1', [id])

    // Insert the new stops
    for (const stop of stops) {
      await query(
        'INSERT INTO stops (route_id, stop_name, stop_order) VALUES ($1, $2, $3)',
        [id, stop.stop_name, stop.stop_order]
      )
    }

    // Commit the transaction
    await query('COMMIT')

    return NextResponse.json({ id, ...route })
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK')
    console.error('Error updating route:', error)
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Route ID is required' }, { status: 400 })
  }

  try {
    // Start a transaction
    await query('BEGIN')

    // Delete the stops associated with the route
    await query('DELETE FROM stops WHERE route_id = $1', [id])

    // Delete the route
    const result = await query('DELETE FROM routes WHERE id = $1', [id])

    // Commit the transaction
    await query('COMMIT')

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK')
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}



