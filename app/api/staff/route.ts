import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { query } from '@/lib/db';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await query(`
      SELECT s.id, s.name, s.contact_number, s.license_number, s.employment_date,
             r.role_name,
             COALESCE(
               (SELECT COUNT(*) FROM bus_staff_assignments bsa
                WHERE bsa.driver_id = s.id OR bsa.conductor_id = s.id OR bsa.cleaner_id = s.id),
               0
             ) AS assignment_count
      FROM staff s
      LEFT JOIN staff_roles sr ON s.id = sr.staff_id
      LEFT JOIN roles r ON sr.role_id = r.id
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await request.json();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO staff (name, contact_number, license_number, employment_date, operator_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [staff.name, staff.contact_number, staff.license_number, staff.employment_date, staff.operator_id]
      );
      const newStaff = result.rows[0];
      if (staff.role_id) {
        await client.query(
          'INSERT INTO staff_roles (staff_id, role_id) VALUES ($1, $2)',
          [newStaff.id, staff.role_id]
        );
      }
      await client.query('COMMIT');
      return NextResponse.json(newStaff);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding staff:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const staff = await request.json();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'UPDATE staff SET name = $1, contact_number = $2, license_number = $3, employment_date = $4 WHERE id = $5 RETURNING *',
        [staff.name, staff.contact_number, staff.license_number, staff.employment_date, staff.id]
      );
      const updatedStaff = result.rows[0];
      if (staff.role_id) {
        await client.query(
          'DELETE FROM staff_roles WHERE staff_id = $1',
          [updatedStaff.id]
        );
        await client.query(
          'INSERT INTO staff_roles (staff_id, role_id) VALUES ($1, $2)',
          [updatedStaff.id, staff.role_id]
        );
      }
      await client.query('COMMIT');
      return NextResponse.json(updatedStaff);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const result = await query('DELETE FROM staff WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}