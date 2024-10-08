import { query } from '@/lib/db'

export async function getDashboardData() {
  const activeBuses = await query(`
    SELECT COUNT(*) as count FROM buses WHERE status = 'Active'
  `)

  const totalRevenue = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN date = CURRENT_DATE THEN amount ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN date = CURRENT_DATE - INTERVAL '1 day' THEN amount ELSE 0 END), 0) as yesterday
    FROM revenue
    WHERE date >= CURRENT_DATE - INTERVAL '1 day'
  `)

  const fuelUsage = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN date = CURRENT_DATE THEN amount ELSE 0 END), 0) as today,
      COALESCE(SUM(CASE WHEN date = CURRENT_DATE - INTERVAL '1 day' THEN amount ELSE 0 END), 0) as yesterday
    FROM fuel_usage
    WHERE date >= CURRENT_DATE - INTERVAL '1 day'
  `)

  const maintenanceAlerts = await query(`
    SELECT 
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN urgency = 'Urgent' THEN 1 ELSE 0 END), 0) as urgent,
      COALESCE(SUM(CASE WHEN urgency = 'Routine' THEN 1 ELSE 0 END), 0) as routine
    FROM maintenance
    WHERE date >= CURRENT_DATE
  `)

  const activeRoutes = await query(`
    SELECT b.number as bus_no, r.name as route, d.name as driver, ar.status, ar.eta
    FROM active_routes ar
    JOIN buses b ON ar.bus_id = b.id
    JOIN routes r ON ar.route_id = r.id
    JOIN drivers d ON ar.driver_id = d.id
    ORDER BY ar.departure_time
    LIMIT 5
  `)

  const staffAvailability = await query(`
    SELECT name, status
    FROM drivers
    ORDER BY name
    LIMIT 5
  `)

  const upcomingMaintenance = await query(`
    SELECT b.number as bus_no, m.type, m.date
    FROM maintenance m
    JOIN buses b ON m.bus_id = b.id
    WHERE m.date > CURRENT_DATE
    ORDER BY m.date
    LIMIT 3
  `)

  const fuelEfficiency = await query(`
    SELECT type,
           ROUND(AVG(fuel_efficiency)::numeric, 1) as avg_consumption,
           CASE
             WHEN AVG(fuel_efficiency) > 5.0 THEN 'Good'
             WHEN AVG(fuel_efficiency) > 4.5 THEN 'Average'
             ELSE 'Poor'
           END as efficiency
    FROM buses
    GROUP BY type
  `)

  const routePerformance = await query(`
    SELECT r.name as route, COALESCE(SUM(rev.amount), 0) as revenue, COALESCE(AVG(rev.occupancy), 0) as occupancy
    FROM routes r
    LEFT JOIN revenue rev ON r.id = rev.route_id AND rev.date = CURRENT_DATE
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