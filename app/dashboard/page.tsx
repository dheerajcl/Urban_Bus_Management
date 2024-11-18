// page.tsx

import { Suspense } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  Bus,
  DollarSign,
  Fuel,
  BarChart3,
  Users,
  Calendar,
  Wrench,
  Phone
} from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RevenueLineChart, FuelUsageLineChart } from "@/components/Charts"
import { getDashboardData } from "@/lib/dashboardQueries"

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <BarChart3 className="h-16 w-16 animate-pulse text-primary" />
  </div>
)

async function DashboardContent() {
  const data = await getDashboardData()

  const revenueChartData = data.weeklyRevenue.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: Number(day.revenue)
  }))

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "#6366F1", // Indigo
    },
  }

  const fuelUsageChartData = data.weeklyFuelUsage.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    fuel_usage: Number(day.fuel_usage)
  }))

  const fuelUsageChartConfig = {
    fuel_usage: {
      label: "Fuel Usage",
      color: "#10B981", // Emerald
    },
  }

  return (
    <div className="p-6 space-y-8 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
      </div>

      {/* Small Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Buses */}
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Active Buses</CardTitle>
            <Bus className="h-6 w-6" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-bold">{data.activeBuses}</div>
            <p className="text-sm opacity-90">
              {Math.round((data.activeBuses / data.totalBuses) * 100)}% of fleet active
            </p>
          </CardContent>
        </Card>

        {/* Bookings Today */}
        <Card className="bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Bookings Today</CardTitle>
            <Calendar className="h-6 w-6" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-bold">{data.bookingsToday}</div>
            <p className="text-sm opacity-90">
              {data.bookingsGrowth >= 0 ? '+' : ''}
              {data.bookingsGrowth}% from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-6 w-6" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-bold">{data.maintenanceAlerts.total}</div>
            <p className="text-sm opacity-90">
              {data.maintenanceAlerts.urgent} urgent, {data.maintenanceAlerts.routine} routine
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Upcoming Maintenance</CardTitle>
            <Wrench className="h-6 w-6" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-4xl font-bold">{data.upcomingMaintenance.length}</div>
            <p className="text-sm opacity-90">
              Maintenance scheduled this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Total Revenue Chart */}
        <Card className="shadow-lg xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Total Revenue</CardTitle>
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">
              ₹{Number(data.totalRevenue.today).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {data.totalRevenue.growth_percentage >= 0 ? '+' : ''}
              {data.totalRevenue.growth_percentage}% from last month
            </p>
            <div className="h-64">
              <RevenueLineChart data={revenueChartData} config={revenueChartConfig} />
            </div>
          </CardContent>
        </Card>

        {/* Fuel Usage Chart */}
        <Card className="shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Fuel Usage</CardTitle>
            <Fuel className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">
              {Number(data.fuelUsage.today).toFixed(2)} L
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {data.fuelUsage.growth_percentage >= 0 ? '+' : ''}
              {data.fuelUsage.growth_percentage}% from yesterday
            </p>
            <div className="h-64">
              <FuelUsageLineChart data={fuelUsageChartData} config={fuelUsageChartConfig} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Active Routes */}
        <Card className="shadow-lg xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Active Routes</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/routes">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus No.</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activeRoutes.map((route, index) => (
                  <TableRow key={index}>
                    <TableCell>{route.bus_no}</TableCell>
                    <TableCell>{route.route}</TableCell>
                    <TableCell>
                      <Badge variant={
                        route.status === 'Scheduled' ? 'default' :
                        route.status === 'On Route' ? 'secondary' : 'outline'
                      }>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {route.eta ? new Date(route.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Staff Availability */}
        <Card className="shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Staff Availability</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {data.staffAvailability.map((staff, index) => (
              <div key={index} className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${staff.name}.png`} alt={staff.name} />
                  <AvatarFallback>{staff.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="text-sm font-medium">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">Driver</p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <Badge variant={staff.status === 'On Duty' ? 'secondary' : 'outline'}>
                    {staff.status}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`tel:${staff.contact_number}`}>
                      <Phone className="h-5 w-5" />
                      <span className="sr-only">Call {staff.name}</span>
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  )
}