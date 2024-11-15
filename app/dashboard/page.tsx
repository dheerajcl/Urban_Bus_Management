import { Suspense } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Bus, DollarSign, Fuel, BarChart3, Users, Phone } from 'lucide-react'
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
      color: "hsl(var(--primary))",
    },
  }

  const fuelUsageChartData = data.weeklyFuelUsage.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    fuel_usage: Number(day.fuel_usage)
  }))

  const fuelUsageChartConfig = {
    fuel_usage: {
      label: "Fuel Usage",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/reports">
            Generate Reports
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Number(data.totalRevenue.today).toLocaleString()} today</div>
            <p className="text-xs text-muted-foreground">
              {data.totalRevenue.growth_percentage >= 0 ? '+' : ''}
              {data.totalRevenue.growth_percentage}% from last month
            </p>
            <div className="h-[200px] mt-4">
              <RevenueLineChart data={revenueChartData} config={revenueChartConfig} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeBuses}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.activeBuses / data.maintenanceAlerts.total) * 100)}% of total fleet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Usage</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(data.fuelUsage.today).toFixed(2)} L today</div>
            <p className="text-xs text-muted-foreground">
              {data.fuelUsage.growth_percentage >= 0 ? '+' : ''}
              {data.fuelUsage.growth_percentage}% from yesterday
            </p>
            <div className="h-[200px] mt-4">
              <FuelUsageLineChart data={fuelUsageChartData} config={fuelUsageChartConfig} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">Active Routes</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/routes">
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Bus No.</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activeRoutes.map((route, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{route.bus_no}</TableCell>
                    <TableCell>{route.route}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === 'Scheduled' ? 'default' : route.status === 'On Route' ? 'secondary' : 'outline'}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{route.eta || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">Route Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Profitability Index</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.routePerformance.map((performance, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{performance.route}</TableCell>
                    <TableCell>₹{Number(performance.revenue).toLocaleString()}</TableCell>
                    <TableCell>{Math.round(Number(performance.occupancy))}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        Number(performance.profitability_index) > 1.5 ? 'default' :
                        Number(performance.profitability_index) > 1 ? 'secondary' : 'destructive'
                      }>
                        {Number(performance.profitability_index).toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Staff Availability</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.staffAvailability.map((staff, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://avatar.vercel.sh/${staff.name}.png`} alt={staff.name} />
                    <AvatarFallback>{staff.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Driver
                    </p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <Badge variant={staff.status === 'On Duty' ? 'default' : 'secondary'}>
                      {staff.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild className="ml-2">
                      <a href={`tel:${staff.contact_number}`}>
                        <Phone className="h-4 w-4" />
                        <span className="sr-only">Call {staff.name}</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-3 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Total Alerts</h3>
                <p className="text-2xl font-bold">{data.maintenanceAlerts.total}</p>
              </div>
              <div className="flex flex-col space-y-3 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Urgent</h3>
                <p className="text-2xl font-bold text-destructive">{data.maintenanceAlerts.urgent}</p>
              </div>
              <div className="flex flex-col space-y-3 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Routine</h3>
                <p className="text-2xl font-bold text-muted-foreground">{data.maintenanceAlerts.routine}</p>
              </div>
              <div className="flex flex-col space-y-3 p-4 border rounded-lg">
                <h3 className="text-sm font-medium">Next Scheduled</h3>
                <p className="text-2xl font-bold">{data.upcomingMaintenance[0]?.date ? new Date(data.upcomingMaintenance[0].date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
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