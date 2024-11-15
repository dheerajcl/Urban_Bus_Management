/* eslint-disable @typescript-eslint/no-explicit-any */
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  console.log('Query Parameters:', [source, destination, date]);

  const scheduleResults = await query(
    `
    WITH route_stops AS (
      SELECT r.id as route_id, s1.stop_order as source_order, s2.stop_order as destination_order
      FROM routes r
      JOIN stops s1 ON r.id = s1.route_id
      JOIN stops s2 ON r.id = s2.route_id
      WHERE s1.stop_name = $1 AND s2.stop_name = $2 AND s1.stop_order < s2.stop_order
    )
    SELECT DISTINCT
      b.id as bus_id,
      b.type,
      b.capacity,
      s.departure,
      s.arrival,
      r.name as route_name,
      s.available_seats,
      r.id as route_id,
      rs.source_order,
      rs.destination_order
    FROM buses b
    JOIN schedules s ON b.id = s.bus_id
    JOIN routes r ON s.route_id = r.id
    JOIN route_stops rs ON r.id = rs.route_id
    WHERE s.departure::date = $3
    ORDER BY s.departure
    `,
    [source, destination, date]
  );

  console.log('Schedule Results:', scheduleResults.rows);

  if (scheduleResults.rows.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // Fetch fare information for all buses in one query
  const fareResults = await query(
    `
    SELECT bus_id, base_fare, per_km_rate
    FROM fare
    WHERE bus_id IN (${scheduleResults.rows.map((bus: any) => bus.bus_id).join(',')})
    `
  );

  console.log('Fare Results:', fareResults.rows);

  // Process each bus result
  const processedResults = await Promise.all(scheduleResults.rows.map(async (bus: any) => {
    const routeId = bus.route_id;
    const sourceOrder = bus.source_order;
    const destinationOrder = bus.destination_order;

    // Fetch distance information
    const distanceResult = await query(
      `
      SELECT SUM(distance_km) as total_distance
      FROM distances
      WHERE route_id = $1 AND
        ((from_stop = $2 AND to_stop = $3) OR
         (from_stop IN (SELECT stop_name FROM stops WHERE route_id = $1 AND stop_order >= $4 AND stop_order < $5)))
      `,
      [routeId, source, destination, sourceOrder, destinationOrder]
    );

    console.log('Distance Query Parameters:', [routeId, source, destination, sourceOrder, destinationOrder]);
    console.log('Distance Result:', distanceResult.rows);

    const distance_km =
      distanceResult.rows.length > 0
        ? parseFloat(distanceResult.rows[0].total_distance)
        : 0;

    console.log('Distance KM:', distance_km);

    // Calculate price
    const fare = fareResults.rows.find((f: any) => f.bus_id === bus.bus_id);
    let price = 0;
    if (fare && distance_km > 0) {
      price = parseFloat(fare.base_fare) + parseFloat(fare.per_km_rate) * distance_km;
    }

    return {
      ...bus,
      price: price.toFixed(2),
      distance_km: distance_km.toFixed(2)
    };
  }));

  console.log('Processed Bus Results:', processedResults);

  return NextResponse.json(processedResults, { status: 200 });
}