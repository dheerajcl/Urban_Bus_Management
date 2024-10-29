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
      'INSERT INTO buses (bus_number, type, capacity, last_maintenance, next_maintenance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, bus.next_maintenance]
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
      'UPDATE buses SET bus_number = $1, type = $2, capacity = $3, last_maintenance = $4, next_maintenance = $5 WHERE id = $6 RETURNING *',
      [bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, 
       bus.next_maintenance, bus.id]
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