import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  Bus,
  DollarSign,
  Fuel,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDashboardData } from "@/lib/dashboardQueries"

export default async function Dashboard() {
  const {
    activeBuses,
    totalRevenue,
    fuelUsage,
    maintenanceAlerts,
    activeRoutes,
    staffAvailability,
    upcomingMaintenance,
    fuelEfficiency,
    routePerformance
  } = await getDashboardData()

  const yesterdayActiveBuses = 40 // This should be fetched from the database in a real scenario

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBuses}</div>
            <p className="text-xs text-muted-foreground">
              {activeBuses > yesterdayActiveBuses ? '+' : '-'}
              {Math.abs(activeBuses - yesterdayActiveBuses)} from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Number(totalRevenue.today).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Number(totalRevenue.today) >= Number(totalRevenue.yesterday) ? '+' : '-'}
              ₹{Math.abs(Number(totalRevenue.today) - Number(totalRevenue.yesterday)).toFixed(2)} from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Usage</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(fuelUsage.today).toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">
              {Number(fuelUsage.today) >= Number(fuelUsage.yesterday) ? '+' : '-'}
              {Math.abs(Number(fuelUsage.today) - Number(fuelUsage.yesterday)).toFixed(2)} L from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceAlerts.total}</div>
            <p className="text-xs text-muted-foreground">{maintenanceAlerts.urgent} urgent, {maintenanceAlerts.routine} routine</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Active Routes</CardTitle>
              <CardDescription>Current bus assignments and status</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/routes">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus No.</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRoutes.map((route, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{route.bus_no}</TableCell>
                    <TableCell>{route.route}</TableCell>
                    <TableCell>{route.driver}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === 'On Time' ? 'default' : route.status === 'Delayed' ? 'secondary' : 'destructive'}>
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
          <CardHeader>
            <CardTitle>Staff Availability</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            {staffAvailability.map((staff, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{staff.name}</p>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
                <Badge variant={staff.status === 'On Duty' ? 'outline' : 'secondary'} className="ml-auto">
                  {staff.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMaintenance.length > 0 ? (
                  upcomingMaintenance.map((maintenance, index) => (
                    <TableRow key={index}>
                      <TableCell>{maintenance.bus_no}</TableCell>
                      <TableCell>{maintenance.type}</TableCell>
                      <TableCell>{new Date(maintenance.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No upcoming maintenance</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Type</TableHead>
                  <TableHead>Avg. Consumption</TableHead>
                  <TableHead>Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelEfficiency.map((efficiency, index) => (
                  <TableRow key={index}>
                    <TableCell>{efficiency.type}</TableCell>
                    <TableCell>{efficiency.avg_consumption} km/L</TableCell>
                    <TableCell>
                      <Badge variant={
                        efficiency.efficiency === 'Good' ? 'default' :
                        efficiency.efficiency === 'Average' ? 'secondary' : 'destructive'
                      }>
                        {efficiency.efficiency}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Occupancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routePerformance.length > 0 ? (
                  routePerformance.map((performance, index) => (
                    <TableRow key={index}>
                      <TableCell>{performance.route}</TableCell>
                      <TableCell>₹{Number(performance.revenue).toFixed(2)}</TableCell>
                      <TableCell>{Math.round(Number(performance.occupancy))}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No route performance data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}