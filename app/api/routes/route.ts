import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT r.*, 
             json_agg(DISTINCT jsonb_build_object('id', s.id, 'stop_name', s.stop_name, 'stop_order', s.stop_order)) as stops,
             json_agg(DISTINCT jsonb_build_object('from_stop', d.from_stop, 'to_stop', d.to_stop, 'distance_km', d.distance_km)) as distances,
             (SELECT jsonb_build_object(
               'is_assigned', CASE WHEN sch.id IS NOT NULL THEN true ELSE false END,
               'bus_id', sch.bus_id,
               'bus_number', b.bus_number,
               'departure', sch.departure,
               'arrival', sch.arrival
             )
             FROM schedules sch
             LEFT JOIN buses b ON sch.bus_id = b.id
             WHERE sch.route_id = r.id
             LIMIT 1) as schedule_info
      FROM routes r
      LEFT JOIN stops s ON r.id = s.route_id
      LEFT JOIN distances d ON r.id = d.route_id
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
    const { name, source, destination, operator_id, stops, distances } = route

    await query('BEGIN')

    const routeResult = await query(
      'INSERT INTO routes (name, source, destination, operator_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, source, destination, operator_id]
    )
    
    const routeId = routeResult.rows[0].id

    for (const stop of stops) {
      await query(
        'INSERT INTO stops (route_id, stop_name, stop_order) VALUES ($1, $2, $3)',
        [routeId, stop.stop_name, stop.stop_order]
      )
    }

    for (const distance of distances) {
      await query(
        'INSERT INTO distances (route_id, from_stop, to_stop, distance_km) VALUES ($1, $2, $3, $4)',
        [routeId, distance.from_stop, distance.to_stop, distance.distance_km]
      )
    }

    await query('COMMIT')

    return NextResponse.json({ id: routeId, ...route })
  } catch (error) {
    await query('ROLLBACK')
    console.error('Error adding route:', error)
    return NextResponse.json({ error: 'Failed to add route' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const route = await request.json()
    const { id, name, source, destination, operator_id, stops, distances } = route

    await query('BEGIN')

    await query(
      'UPDATE routes SET name = $1, source = $2, destination = $3, operator_id = $4 WHERE id = $5',
      [name, source, destination, operator_id, id]
    )

    await query('DELETE FROM stops WHERE route_id = $1', [id])
    for (const stop of stops) {
      await query(
        'INSERT INTO stops (route_id, stop_name, stop_order) VALUES ($1, $2, $3)',
        [id, stop.stop_name, stop.stop_order]
      )
    }

    await query('DELETE FROM distances WHERE route_id = $1', [id])
    for (const distance of distances) {
      await query(
        'INSERT INTO distances (route_id, from_stop, to_stop, distance_km) VALUES ($1, $2, $3, $4)',
        [id, distance.from_stop, distance.to_stop, distance.distance_km]
      )
    }

    await query('COMMIT')

    return NextResponse.json({ id, ...route })
  } catch (error) {
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
    await query('BEGIN')

    await query('DELETE FROM stops WHERE route_id = $1', [id])
    await query('DELETE FROM distances WHERE route_id = $1', [id])
    const result = await query('DELETE FROM routes WHERE id = $1', [id])

    await query('COMMIT')

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    await query('ROLLBACK')
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}