import { query } from '@/lib/db'

export async function getDashboardData() {
  const currentDate = new Date().toISOString().split('T')[0]
  const lastMonthDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]

  try {
    const activeBuses = await query(`
      SELECT COUNT(DISTINCT b.id) as count 
      FROM buses b
      JOIN schedules s ON b.id = s.bus_id
      WHERE DATE(s.departure) = CURRENT_DATE
    `)

    const totalRevenue = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE THEN b.total_price ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE - INTERVAL '1 month' THEN b.total_price ELSE 0 END), 0) as last_month,
        ROUND(
          ((SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE THEN b.total_price ELSE 0 END) - 
            SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE - INTERVAL '1 month' THEN b.total_price ELSE 0 END)) / 
           NULLIF(SUM(CASE WHEN DATE(b.booking_date) = CURRENT_DATE - INTERVAL '1 month' THEN b.total_price ELSE 0 END), 0) * 100
          )::numeric, 1
        ) as growth_percentage
      FROM bookings b
      WHERE b.booking_date >= CURRENT_DATE - INTERVAL '1 month'
        AND b.payment_status = 'PENDING'
    `)

    const fuelUsage = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE THEN fr.fuel_amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END), 0) as yesterday,
        ROUND(
          ((SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE THEN fr.fuel_amount ELSE 0 END) - 
            SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END)) / 
           NULLIF(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END), 0) * 100
          )::numeric, 1
        ) as growth_percentage
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
      JOIN buses b ON sch.bus_id = b.id
      JOIN routes r ON sch.route_id = r.id
      JOIN bus_staff_assignments bsa ON b.id = bsa.bus_id
      JOIN staff s ON bsa.driver_id = s.id
      WHERE DATE(sch.departure) = CURRENT_DATE
      ORDER BY sch.departure
      LIMIT 5
    `)  

    const staffAvailability = await query(`
      SELECT s.name, 
             s.contact_number,
             CASE WHEN bsa.id IS NOT NULL THEN 'On Duty' ELSE 'Available' END as status
      FROM staff s
      LEFT JOIN bus_staff_assignments bsa ON s.id = bsa.driver_id AND bsa.assignment_date = CURRENT_DATE
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

    const routePerformance = await query(`
      SELECT r.name as route, 
             ROUND(calculate_avg_revenue_per_route(r.id, $1, $2)::numeric, 2) as revenue,
             ROUND(calculate_occupancy_rate(r.id, $1, $2)::numeric, 2) as occupancy,
             ROUND(calculate_profitability_index(r.id, $1, $2)::numeric, 2) as profitability_index
      FROM routes r
      ORDER BY revenue DESC
      LIMIT 3
    `, [currentDate, lastMonthDate])

    const weeklyRevenue = await query(`
      WITH RECURSIVE dates AS (
        SELECT CURRENT_DATE - INTERVAL '6 days' as date
        UNION ALL
        SELECT date + INTERVAL '1 day'
        FROM dates
        WHERE date < CURRENT_DATE
      )
      SELECT d.date::date,
             COALESCE(SUM(b.total_price), 0) as revenue
      FROM dates d
      LEFT JOIN bookings b ON DATE(b.booking_date) = d.date AND b.payment_status = 'PENDING'
      GROUP BY d.date
      ORDER BY d.date
    `)

    const weeklyFuelUsage = await query(`
      WITH RECURSIVE dates AS (
        SELECT CURRENT_DATE - INTERVAL '6 days' as date
        UNION ALL
        SELECT date + INTERVAL '1 day'
        FROM dates
        WHERE date < CURRENT_DATE
      )
      SELECT d.date::date,
             COALESCE(SUM(fr.fuel_amount), 0) as fuel_usage
      FROM dates d
      LEFT JOIN fuel_records fr ON DATE(fr.date) = d.date
      GROUP BY d.date
      ORDER BY d.date
    `)

    return {
      activeBuses: activeBuses.rows[0]?.count ?? 0,
      totalRevenue: totalRevenue.rows[0] ?? { today: 0, last_month: 0, growth_percentage: 0 },
      fuelUsage: fuelUsage.rows[0] ?? { today: 0, yesterday: 0, growth_percentage: 0 },
      maintenanceAlerts: maintenanceAlerts.rows[0] ?? { total: 0, urgent: 0, routine: 0 },
      activeRoutes: activeRoutes.rows ?? [],
      staffAvailability: staffAvailability.rows ?? [],
      upcomingMaintenance: upcomingMaintenance.rows ?? [],
      routePerformance: routePerformance.rows ?? [],
      weeklyRevenue: weeklyRevenue.rows ?? [],
      weeklyFuelUsage: weeklyFuelUsage.rows ?? []
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}