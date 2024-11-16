import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const routeId = request.nextUrl.searchParams.get('routeId')

  if (!routeId) {
    return NextResponse.json({ error: 'Route ID is required' }, { status: 400 })
  }

  try {
    // Fetch the currently assigned bus for the route
    const assignedBusResult = await query(`
      SELECT b.id, b.bus_number, b.capacity
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      WHERE s.route_id = $1
    `, [routeId])

    // Fetch all available (unassigned) buses
    const availableBusesResult = await query(`
      SELECT id, bus_number, capacity
      FROM buses
      WHERE id NOT IN (SELECT bus_id FROM schedules WHERE route_id != $1)
    `, [routeId])

    // Combine the results, marking the assigned bus
    const assignedBus = assignedBusResult.rows[0]
    const availableBuses = availableBusesResult.rows

    const allBuses = [
      ...(assignedBus ? [{ ...assignedBus, isAssigned: true }] : []),
      ...availableBuses.map(bus => ({ ...bus, isAssigned: false }))
    ]

    return NextResponse.json(allBuses)
  } catch (error) {
    console.error('Error fetching available buses:', error)
    return NextResponse.json({ error: 'Failed to fetch available buses' }, { status: 500 })
  }
}