import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM buses');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bus = await request.json();
    const result = await query(
      'INSERT INTO buses (operator_id, bus_number, type, capacity, last_maintenance, next_maintenance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [bus.operator_id, bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, bus.next_maintenance]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding bus:', error);
    return NextResponse.json({ error: 'Failed to add bus' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const result = await query('DELETE FROM buses WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const bus = await request.json();
    const result = await query(
      'UPDATE buses SET operator_id = $1, bus_number = $2, type = $3, capacity = $4, last_maintenance = $5, next_maintenance = $6 WHERE id = $7 RETURNING *',
      [bus.operator_id, bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, bus.next_maintenance, bus.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}
