import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const busId = request.nextUrl.searchParams.get('busId');

  try {
    const sql = `
      SELECT DISTINCT
        s.id,
        s.name,
        r.role_name
      FROM staff s
      JOIN staff_roles sr ON s.id = sr.staff_id
      JOIN roles r ON sr.role_id = r.id
      WHERE s.id NOT IN (
        SELECT driver_id FROM bus_staff_assignments 
        WHERE driver_id IS NOT NULL
        ${busId ? `AND bus_id != $1` : ''}
        UNION
        SELECT conductor_id FROM bus_staff_assignments 
        WHERE conductor_id IS NOT NULL
        ${busId ? `AND bus_id != $1` : ''}
        UNION
        SELECT cleaner_id FROM bus_staff_assignments 
        WHERE cleaner_id IS NOT NULL
        ${busId ? `AND bus_id != $1` : ''}
      )
      OR s.id IN (
        SELECT COALESCE(driver_id, conductor_id, cleaner_id)
        FROM bus_staff_assignments
        WHERE bus_id = $1
      )
      ORDER BY s.name;
    `;

    const values = busId ? [busId] : [];
    const result = await query(sql, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching available staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available staff' },
      { status: 500 }
    );
  }
}
