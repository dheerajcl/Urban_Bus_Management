import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const destination = searchParams.get('destination');

  if (!source || !destination) {
    return NextResponse.json({ error: 'Source and destination are required' }, { status: 400 });
  }

  try {
    const result = await query(`
      SELECT DISTINCT b.id, b.type, b.capacity
      FROM buses b
      JOIN schedules s ON b.id = s.bus_id
      JOIN routes r ON s.route_id = r.id
      JOIN stops source_stop ON r.id = source_stop.route_id
      JOIN stops dest_stop ON r.id = dest_stop.route_id
      WHERE source_stop.stop_name = $1
        AND dest_stop.stop_name = $2
        AND source_stop.stop_order < dest_stop.stop_order
    `, [source, destination]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching unique buses:', error);
    return NextResponse.json({ error: 'Failed to fetch unique buses' }, { status: 500 });
  }
}