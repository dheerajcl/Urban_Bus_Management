import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  console.log('Query Parameters:', [source, destination, date]);

  // Fetch schedules
  const scheduleResults = await query(
    `
    SELECT
      b.id as bus_id,
      b.type,
      b.capacity,
      s.departure,
      s.arrival,
      r.name as route_name,
      s.available_seats,
      r.id as route_id
    FROM buses b
    JOIN schedules s ON b.id = s.bus_id
    JOIN routes r ON s.route_id = r.id
    WHERE r.source = $1 AND r.destination = $2 AND s.departure::date = $3
    `,
    [source, destination, date]
  );

  console.log('Schedule Results:', scheduleResults.rows);

  if (scheduleResults.rows.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const routeId = scheduleResults.rows[0].route_id;

  console.log('Route ID:', routeId);

  // Fetch fare information using bus_id
  const fareResults = await query(
    `
    SELECT bus_id, base_fare, per_km_rate
    FROM fare
    WHERE bus_id IN (${scheduleResults.rows.map((bus: any) => bus.bus_id).join(',')})
    `
  );

  console.log('Fare Results:', fareResults.rows);

  // Fetch distance information
  const distanceResult = await query(
    `
    WITH RECURSIVE route_path AS (
        SELECT 
            route_id,
            from_stop,
            to_stop,
            CAST(distance_km AS DECIMAL(5, 2)) AS total_distance
        FROM 
            distances
        WHERE 
            route_id = $1 AND from_stop = $2

        UNION ALL

        SELECT 
            d.route_id,
            d.from_stop,
            d.to_stop,
            CAST(rp.total_distance + d.distance_km AS DECIMAL(5, 2)) AS total_distance
        FROM 
            distances d
        INNER JOIN 
            route_path rp ON rp.to_stop = d.from_stop
        WHERE 
            d.route_id = rp.route_id
    )
    SELECT total_distance
    FROM route_path
    WHERE to_stop = $3
    ORDER BY total_distance
    LIMIT 1;
    `,
    [routeId, source, destination]
  );

  console.log('Distance Query Parameters:', [routeId, source, destination]);
  console.log('Distance Result:', distanceResult.rows);

  // Get the distance value
  const distance_km =
    distanceResult.rows.length > 0
      ? parseFloat(distanceResult.rows[0].total_distance)
      : 0;

  console.log('Distance KM:', distance_km);

  // Combine the results
  const updatedBusResults = scheduleResults.rows.map((bus: any) => {
    const fare = fareResults.rows.find((f: any) => f.bus_id === bus.bus_id);
    if (fare && distance_km > 0) {
      const price =
        parseFloat(fare.base_fare) + parseFloat(fare.per_km_rate) * distance_km;
      return {
        ...bus,
        price: price.toFixed(2),
      };
    }
    return bus;
  });

  console.log('Updated Bus Results:', updatedBusResults);

  return NextResponse.json(updatedBusResults, { status: 200 });
}