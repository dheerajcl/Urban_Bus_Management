import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT b.*,
        CASE WHEN EXISTS (
          SELECT 1 
          FROM bus_staff_assignments bsa 
          WHERE bsa.bus_id = b.id 
          AND (
            bsa.driver_id IS NOT NULL OR 
            bsa.conductor_id IS NOT NULL OR 
            bsa.cleaner_id IS NOT NULL
          )
        ) THEN true 
        ELSE false 
        END as staff_assigned
      FROM buses b
    `);
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
      'INSERT INTO buses (operator_id, bus_number, type, capacity, last_maintenance, next_maintenance, mileage) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [bus.operator_id, bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, bus.next_maintenance, bus.mileage]
    );
    

    const fareResult = await query(
      'INSERT INTO fare (bus_id, base_fare, per_km_rate, per_stop_rate) VALUES ($1, $2, $3, $4) RETURNING *',
      [result.rows[0].id, bus.base_fare, bus.per_km_rate, bus.per_stop_rate]
    );

    const response = {
      ...result.rows[0],
      fare: fareResult.rows[0]
    };

    return NextResponse.json(response);
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
    
    // Update bus details
    const busResult = await query(
      'UPDATE buses SET operator_id = $1, bus_number = $2, type = $3, capacity = $4, last_maintenance = $5, next_maintenance = $6, mileage = $7 WHERE id = $8 RETURNING *',
      [bus.operator_id, bus.bus_number, bus.type, bus.capacity, bus.last_maintenance, bus.next_maintenance, bus.mileage, bus.id]
    );
    
    if (busResult.rowCount === 0) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    // Update fare details
    const fareResult = await query(
      'UPDATE fare SET base_fare = $1, per_km_rate = $2, per_stop_rate = $3 WHERE bus_id = $4 RETURNING *',
      [bus.base_fare, bus.per_km_rate, bus.per_stop_rate, bus.id]
    );

    // Combine the responses
    const response = {
      ...busResult.rows[0],
      fare: fareResult.rows[0]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}