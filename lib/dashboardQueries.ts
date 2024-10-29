import { query } from '@/lib/db'

export async function getDashboardData() {
  const activeBuses = await query(`
    SELECT COUNT(*) as count FROM buses
    WHERE id IN (
      SELECT DISTINCT bus_id FROM schedules
      WHERE DATE(departure_time) = CURRENT_DATE
    )
  `)

  const totalRevenue = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE THEN b.seats_booked * s.price ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE - INTERVAL '1 day' THEN b.seats_booked * s.price ELSE 0 END), 0) as yesterday
    FROM bookings b
    JOIN schedules s ON b.schedule_id = s.id
    WHERE b.booking_date >= CURRENT_DATE - INTERVAL '1 day'
      AND b.payment_status = 'COMPLETED'
  `)

  const fuelUsage = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN DATE(maintenance_date) = CURRENT_DATE THEN cost ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN DATE(maintenance_date) = CURRENT_DATE - INTERVAL '1 day' THEN cost ELSE 0 END), 0) as yesterday
    FROM maintenance_records
    WHERE maintenance_date >= CURRENT_DATE - INTERVAL '1 day'
      AND description ILIKE '%fuel%'
  `)

  const maintenanceAlerts = await query(`
    SELECT 
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN next_maintenance <= CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as urgent,
      COALESCE(SUM(CASE WHEN next_maintenance > CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as routine
    FROM buses
    WHERE next_maintenance IS NOT NULL
  `)

  const activeRoutes = await query(`
    SELECT b.bus_number as bus_no, r.name as route, d.name as driver, 
           s.departure_time, s.arrival_time,
           CASE 
             WHEN s.departure_time > CURRENT_TIMESTAMP THEN 'Scheduled'
             WHEN s.departure_time <= CURRENT_TIMESTAMP AND s.arrival_time > CURRENT_TIMESTAMP THEN 'On Route'
             ELSE 'Completed'
           END as status,
           CASE 
             WHEN s.departure_time > CURRENT_TIMESTAMP THEN s.departure_time::text
             WHEN s.arrival_time > CURRENT_TIMESTAMP THEN s.arrival_time::text
             ELSE NULL
           END as eta
    FROM schedules s
    JOIN buses b ON s.bus_id = b.id
    JOIN routes r ON s.route_id = r.id
    JOIN bus_assignments ba ON b.id = ba.bus_id
    JOIN drivers d ON ba.driver_id = d.id
    WHERE DATE(s.departure_time) = CURRENT_DATE
    ORDER BY s.departure_time
    LIMIT 5
  `)

  const staffAvailability = await query(`
    SELECT d.name, 
           CASE WHEN ba.id IS NOT NULL THEN 'On Duty' ELSE 'Available' END as status
    FROM drivers d
    LEFT JOIN bus_assignments ba ON d.id = ba.driver_id AND ba.assignment_date = CURRENT_DATE
    ORDER BY d.name
    LIMIT 5
  `)

  const upcomingMaintenance = await query(`
    SELECT bus_number as bus_no, 'Scheduled Maintenance' as type, next_maintenance as date
    FROM buses
    WHERE next_maintenance > CURRENT_DATE
    ORDER BY next_maintenance
    LIMIT 3
  `)

  const fuelEfficiency = await query(`
    SELECT b.type,
           ROUND(CAST(AVG(b.capacity::float / NULLIF(mr.cost, 0)) AS numeric), 2) as avg_consumption,
           CASE
             WHEN AVG(b.capacity::float / NULLIF(mr.cost, 0)) > 0.5 THEN 'Good'
             WHEN AVG(b.capacity::float / NULLIF(mr.cost, 0)) > 0.3 THEN 'Average'
             ELSE 'Poor'
           END as efficiency
    FROM buses b
    LEFT JOIN maintenance_records mr ON b.id = mr.bus_id AND mr.description ILIKE '%fuel%'
    GROUP BY b.type
  `)

  const routePerformance = await query(`
    SELECT r.name as route, 
           COALESCE(SUM(b.seats_booked * s.price), 0) as revenue, 
           COALESCE(AVG(b.seats_booked::float / s.available_seats), 0) as occupancy
    FROM routes r
    LEFT JOIN schedules s ON r.id = s.route_id
    LEFT JOIN bookings b ON s.id = b.schedule_id
    WHERE DATE(b.booking_date) = CURRENT_DATE
      AND b.payment_status = 'COMPLETED'
    GROUP BY r.name
    ORDER BY revenue DESC
    LIMIT 3
  `)

  return {
    activeBuses: activeBuses.rows[0].count,
    totalRevenue: totalRevenue.rows[0],
    fuelUsage: fuelUsage.rows[0],
    maintenanceAlerts: maintenanceAlerts.rows[0],
    activeRoutes: activeRoutes.rows,
    staffAvailability: staffAvailability.rows,
    upcomingMaintenance: upcomingMaintenance.rows,
    fuelEfficiency: fuelEfficiency.rows,
    routePerformance: routePerformance.rows
  }
}