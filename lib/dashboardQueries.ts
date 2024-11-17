// dashboardQueries.ts

import { query } from '@/lib/db'

export async function getDashboardData() {
  const currentDate = new Date().toISOString().split('T')[0]
  // const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
  const lastMonthDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]

  try {
    // Total Buses
    const totalBusesResult = await query(`
      SELECT COUNT(*) as total
      FROM buses
    `)
    const totalBuses = totalBusesResult.rows[0]?.total ?? 0

    // Active Buses
    const activeBusesResult = await query(`
      SELECT COUNT(DISTINCT b.id) as count 
      FROM buses b
      JOIN schedules s ON b.id = s.bus_id
      WHERE s.departure <= NOW() AND s.arrival >= NOW()
    `)
    const activeBuses = activeBusesResult.rows[0]?.count ?? 0

    // Bookings Today and Growth Percentage
    const bookingsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE THEN 1 ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END), 0) as yesterday,
        CASE WHEN SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END) = 0 THEN 0
             ELSE ROUND(
               ((SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE THEN 1 ELSE 0 END) - 
                 SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END)) / 
                NULLIF(SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END), 0) * 100
               )::numeric, 1)
        END as growth_percentage
      FROM bookings
      WHERE DATE(booking_date) >= CURRENT_DATE - INTERVAL '1 day'
    `)
    const bookingsToday = bookingsResult.rows[0]?.today ?? 0
    const bookingsGrowth = bookingsResult.rows[0]?.growth_percentage ?? 0

    // Total Revenue
    const totalRevenueResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE THEN total_price ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN DATE(booking_date) BETWEEN DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') THEN total_price ELSE 0 END), 0) as last_month,
        CASE WHEN SUM(CASE WHEN DATE(booking_date) BETWEEN DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') THEN total_price ELSE 0 END) = 0 THEN 0
             ELSE ROUND(
               ((SUM(CASE WHEN DATE(booking_date) = CURRENT_DATE THEN total_price ELSE 0 END) - 
                 SUM(CASE WHEN DATE(booking_date) BETWEEN DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') THEN total_price ELSE 0 END)) / 
                NULLIF(SUM(CASE WHEN DATE(booking_date) BETWEEN DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day') THEN total_price ELSE 0 END), 0) * 100
               )::numeric, 1)
        END as growth_percentage
      FROM bookings
      WHERE booking_date >= CURRENT_DATE - INTERVAL '1 month'
        AND payment_status = 'PENDING'
    `)
    const totalRevenue = totalRevenueResult.rows[0] ?? { today: 0, last_month: 0, growth_percentage: 0 }

    // Fuel Usage
    const fuelUsageResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE THEN fr.fuel_amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END), 0) as yesterday,
        CASE WHEN SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END) = 0 THEN 0
             ELSE ROUND(
               ((SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE THEN fr.fuel_amount ELSE 0 END) - 
                 SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END)) / 
                NULLIF(SUM(CASE WHEN DATE(fr.date) = CURRENT_DATE - INTERVAL '1 day' THEN fr.fuel_amount ELSE 0 END), 0) * 100
               )::numeric, 1)
        END as growth_percentage
      FROM fuel_records fr
      WHERE DATE(fr.date) >= CURRENT_DATE - INTERVAL '1 day'
    `)
    const fuelUsage = fuelUsageResult.rows[0] ?? { today: 0, yesterday: 0, growth_percentage: 0 }

    // Maintenance Alerts
    const maintenanceAlertsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN b.next_maintenance <= CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as urgent,
        COALESCE(SUM(CASE WHEN b.next_maintenance > CURRENT_DATE + INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as routine
      FROM buses b
      WHERE b.next_maintenance IS NOT NULL
    `)
    const maintenanceAlerts = maintenanceAlertsResult.rows[0] ?? { total: 0, urgent: 0, routine: 0 }

    // Active Routes
    const activeRoutesResult = await query(`
      SELECT b.bus_number as bus_no, r.name as route, s.name as driver, 
             sch.departure, sch.arrival,
             CASE 
               WHEN sch.departure > CURRENT_TIMESTAMP THEN 'Scheduled'
               WHEN sch.departure <= CURRENT_TIMESTAMP AND sch.arrival >= CURRENT_TIMESTAMP THEN 'On Route'
               ELSE 'Completed'
             END as status,
             CASE 
               WHEN sch.departure > CURRENT_TIMESTAMP THEN sch.departure::text
               WHEN sch.arrival >= CURRENT_TIMESTAMP THEN sch.arrival::text
               ELSE NULL
             END as eta
      FROM schedules sch
      JOIN buses b ON sch.bus_id = b.id
      JOIN routes r ON sch.route_id = r.id
      LEFT JOIN bus_staff_assignments bsa ON b.id = bsa.bus_id AND bsa.assignment_date = CURRENT_DATE
      LEFT JOIN staff s ON bsa.driver_id = s.id
      WHERE DATE(sch.departure) = CURRENT_DATE
      ORDER BY sch.departure
      LIMIT 5
    `)
    const activeRoutes = activeRoutesResult.rows ?? []

    // Staff Availability
    const staffAvailabilityResult = await query(`
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
    const staffAvailability = staffAvailabilityResult.rows ?? []

    // Upcoming Maintenance
    const upcomingMaintenanceResult = await query(`
      SELECT b.bus_number as bus_no, 'Scheduled Maintenance' as type, b.next_maintenance as date
      FROM buses b
      WHERE b.next_maintenance >= CURRENT_DATE
      ORDER BY b.next_maintenance
      LIMIT 3
    `)
    const upcomingMaintenance = upcomingMaintenanceResult.rows ?? []

    // Route Performance
    const routePerformanceResult = await query(`
      SELECT r.name as route, 
             ROUND(calculate_avg_revenue_per_route(r.id, $1, $2)::numeric, 2) as revenue,
             ROUND(calculate_occupancy_rate(r.id, $1, $2)::numeric, 2) as occupancy,
             ROUND(calculate_profitability_index(r.id, $1, $2)::numeric, 2) as profitability_index
      FROM routes r
      ORDER BY revenue DESC
      LIMIT 3
    `, [currentDate, lastMonthDate])
    const routePerformance = routePerformanceResult.rows ?? []

    // Weekly Revenue
    const weeklyRevenueResult = await query(`
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
    const weeklyRevenue = weeklyRevenueResult.rows ?? []

    // Weekly Fuel Usage
    const weeklyFuelUsageResult = await query(`
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
    const weeklyFuelUsage = weeklyFuelUsageResult.rows ?? []

    return {
      totalBuses,
      activeBuses,
      bookingsToday,
      bookingsGrowth,
      totalRevenue,
      fuelUsage,
      maintenanceAlerts,
      activeRoutes,
      staffAvailability,
      upcomingMaintenance,
      routePerformance,
      weeklyRevenue,
      weeklyFuelUsage,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}