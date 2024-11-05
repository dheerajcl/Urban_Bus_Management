import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const routeId = params.id

  try {
    // Start a transaction
    await query('BEGIN')

    try {
      // Delete the schedule for the route
      const deleteScheduleResult = await query(
        'DELETE FROM schedules WHERE route_id = $1 RETURNING *',
        [routeId]
      )

      if (deleteScheduleResult.rowCount === 0) {
        throw new Error('No bus assignment found for this route')
      }

      // Delete the distances associated with this route
      await query('DELETE FROM distances WHERE route_id = $1', [routeId])

      // Commit the transaction
      await query('COMMIT')

      return NextResponse.json({ message: 'Bus de-assigned successfully' }, { status: 200 })
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error de-assigning bus:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to de-assign bus' },
      { status: 500 }
    )
  }
}