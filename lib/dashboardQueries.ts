import { query } from '@/lib/db'

export async function getDashboardData() {
  const activeBuses = await query(`
    SELECT COUNT(DISTINCT b.id) as count 
    FROM buses b
    JOIN schedules s ON b.id = s.bus_id
    WHERE DATE(s.departure) = CURRENT_DATE
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
      COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE THEN fr.fuel_amount ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END), 0) as yesterday
    FROM fuel_records fr
    WHERE fr.date >= CURRENT_DATE - INTERVAL '1 day'
  `)

  const maintenanceAlerts = await query(`
    SELECT 
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN b.next_maintenance <= CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as urgent,
      COALESCE(SUM(CASE WHEN b.next_maintenance > CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as routine
    FROM buses b
    WHERE b.next_maintenance IS NOT NULL
  `)

  const activeRoutes = await query(`
    SELECT b.bus_number as bus_no, r.name as route, s.name as driver, 
           sch.departure, sch.arrival,
           CASE 
             WHEN sch.departure > CURRENT_TIMESTAMP THEN 'Scheduled'
             WHEN sch.departure <= CURRENT_TIMESTAMP AND sch.arrival > CURRENT_TIMESTAMP THEN 'On Route'
             ELSE 'Completed'
           END as status,
           CASE 
             WHEN sch.departure > CURRENT_TIMESTAMP THEN sch.departure::text
             WHEN sch.arrival > CURRENT_TIMESTAMP THEN sch.arrival::text
             ELSE NULL
           END as eta
    FROM schedules sch
    JOIN buses b ON sch.bus_id = b.id  -- b.id refers to buses
    JOIN routes r ON sch.route_id = r.id
    JOIN bus_assignments ba ON b.id = ba.bus_id  -- ba.bus_id refers to bus_assignments
    JOIN staff s ON ba.staff_id = s.id
    JOIN staff_roles sr ON s.id = sr.staff_id
    JOIN roles ro ON sr.role_id = ro.id
    WHERE DATE(sch.departure) = CURRENT_DATE AND ro.role_name = 'Driver'
    ORDER BY sch.departure
    LIMIT 5
  `)  

  const staffAvailability = await query(`
    SELECT s.name, 
           s.contact_number,
           CASE WHEN ba.id IS NOT NULL THEN 'On Duty' ELSE 'Available' END as status
    FROM staff s
    LEFT JOIN bus_assignments ba ON s.id = ba.staff_id AND ba.assignment_date = CURRENT_DATE
    JOIN staff_roles sr ON s.id = sr.staff_id
    JOIN roles r ON sr.role_id = r.id
    WHERE r.role_name = 'Driver'
    ORDER BY s.name
    LIMIT 5
  `)

  const upcomingMaintenance = await query(`
    SELECT b.bus_number as bus_no, 'Scheduled Maintenance' as type, b.next_maintenance as date
    FROM buses b
    WHERE b.next_maintenance > CURRENT_DATE
    ORDER BY b.next_maintenance
    LIMIT 3
  `)

  const fuelEfficiency = await query(`
    SELECT b.type,
           ROUND(AVG(calculate_fuel_efficiency(b.id))::numeric, 2) as avg_consumption,
           CASE
             WHEN AVG(calculate_fuel_efficiency(b.id)) > 10 THEN 'Good'
             WHEN AVG(calculate_fuel_efficiency(b.id)) > 5 THEN 'Average'
             ELSE 'Poor'
           END as efficiency
    FROM buses b
    GROUP BY b.type
  `)

  const routePerformance = await query(`
    SELECT r.name as route, 
       ROUND(calculate_avg_revenue_per_route(r.id)::numeric, 2) as revenue, 
       ROUND(calculate_occupancy_rate(r.id)::numeric, 2) as occupancy
    FROM routes r
    ORDER BY revenue DESC
    LIMIT 3;
  `)

  const profitabilityIndex = await query(`
    SELECT r.name as route,
           ROUND(calculate_profitability_index(r.id)::numeric, 2) as index
    FROM routes r
    ORDER BY index DESC
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
    routePerformance: routePerformance.rows,
    profitabilityIndex: profitabilityIndex.rows
  }
}

