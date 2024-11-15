import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { busId, driverId, conductorId, cleanerId } = await request.json();
    await query('BEGIN');
    const result = await query(
      `INSERT INTO bus_staff_assignments (bus_id, driver_id, conductor_id, cleaner_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (bus_id) DO UPDATE
       SET driver_id = $2, conductor_id = $3, cleaner_id = $4
       RETURNING *`,
      [busId, driverId, conductorId, cleanerId]
    );

    // Update buses table
    await query('UPDATE buses SET staff_assigned = TRUE WHERE id = $1', [busId]);

    await query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Staff assigned successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error assigning staff:', error);
    return NextResponse.json({ error: 'Failed to assign staff' }, { status: 500 });
  }
}