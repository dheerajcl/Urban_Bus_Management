import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { busId, driverName, conductorName, cleanerName } = await request.json();

    // Start a transaction
    await query('BEGIN');

    // Look up staff IDs based on names and roles
    const driverResult = await query(`
      SELECT s.id 
      FROM staff s
      JOIN staff_roles sr ON s.id = sr.staff_id
      JOIN roles r ON sr.role_id = r.id
      WHERE LOWER(s.name) = LOWER($1) AND LOWER(r.role_name) = LOWER($2)
    `, [driverName, 'Driver']);

    const conductorResult = await query(`
      SELECT s.id 
      FROM staff s
      JOIN staff_roles sr ON s.id = sr.staff_id
      JOIN roles r ON sr.role_id = r.id
      WHERE LOWER(s.name) = LOWER($1) AND LOWER(r.role_name) = LOWER($2)
    `, [conductorName, 'Conductor']);

    let cleanerResult = null;
    if (cleanerName) {
      cleanerResult = await query(`
        SELECT s.id 
        FROM staff s
        JOIN staff_roles sr ON s.id = sr.staff_id
        JOIN roles r ON sr.role_id = r.id
        WHERE LOWER(s.name) = LOWER($1) AND LOWER(r.role_name) = LOWER($2)
      `, [cleanerName, 'Cleaner']);
    }

    if (driverResult.rows.length === 0 || conductorResult.rows.length === 0) {
      throw new Error('Driver or conductor not found');
    }

    const driverId = driverResult.rows[0].id;
    const conductorId = conductorResult.rows[0].id;
    const cleanerId = cleanerResult?.rows[0]?.id || null;

    // Insert or update the bus_staff_assignments
    const result = await query(
      `INSERT INTO bus_staff_assignments (bus_id, driver_id, conductor_id, cleaner_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (bus_id) DO UPDATE
       SET driver_id = $2, conductor_id = $3, cleaner_id = $4
       RETURNING *`,
      [busId, driverId, conductorId, cleanerId]
    );

    // Update the buses table
    await query('UPDATE buses SET staff_assigned = TRUE WHERE id = $1', [busId]);

    // Commit the transaction
    await query('COMMIT');

    return NextResponse.json({ success: true, message: 'Staff assigned successfully' });
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK');

    if (error instanceof Error) {
      console.error('Error assigning staff:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
    }
  }
}