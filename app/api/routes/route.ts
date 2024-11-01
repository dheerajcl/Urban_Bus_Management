import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT r.*, b.bus_number, 
             json_agg(json_build_object('id', s.id, 'stop_name', s.stop_name, 'stop_order', s.stop_order)) as stops
      FROM routes r
      LEFT JOIN buses b ON r.bus_id = b.id
      LEFT JOIN stops s ON r.id = s.route_id
      GROUP BY r.id, b.bus_number
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
    const { name, source, destination, bus_number, stops } = route

    // Start a transaction
    await query('BEGIN')

    // Insert the route
    const routeResult = await query(
      'INSERT INTO routes (name, source, destination) VALUES ($1, $2, $3) RETURNING id',
      [name, source, destination]
    )
    
    const routeId = routeResult.rows[0].id

    // Get or create the bus
    const busResult = await query(
      'INSERT INTO buses (bus_number) VALUES ($1) ON CONFLICT (bus_number) DO UPDATE SET bus_number = EXCLUDED.bus_number RETURNING id',
      [bus_number]
    )
    const busId = busResult.rows[0].id

    // Update the route with the bus_id
    await query('UPDATE routes SET bus_id = $1 WHERE id = $2', [busId, routeId])

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
    const { id, name, source, destination, bus_number, stops } = route

    // Start a transaction
    await query('BEGIN')

    // Update the route
    await query(
      'UPDATE routes SET name = $1, source = $2, destination = $3 WHERE id = $4',
      [name, source, destination, id]
    )

    // Get or create the bus
    const busResult = await query(
      'INSERT INTO buses (bus_number) VALUES ($1) ON CONFLICT (bus_number) DO UPDATE SET bus_number = EXCLUDED.bus_number RETURNING id',
      [bus_number]
    )
    const busId = busResult.rows[0].id

    // Update the route with the bus_id
    await query('UPDATE routes SET bus_id = $1 WHERE id = $2', [busId, id])

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