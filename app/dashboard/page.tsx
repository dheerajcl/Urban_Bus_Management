'use client'

import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bus,
  Calendar,
  CircleUser,
  Clock,
  CreditCard,
  DollarSign,
  Fuel,
  MapPin,
  Menu,
  Route,
  Search,
  Users,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Bus className="h-6 w-6" />
            {/* <span className="no-warp">Swift Commute</span> */}
          </Link>
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Buses
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Routes
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Staff
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Reports
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Bus className="h-6 w-6" />
                <span>Urban Bus Management</span>
              </Link>
              <Link href="#" className="hover:text-primary">
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                Buses
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                Routes
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                Staff
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                Reports
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search buses, routes, staff..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Depot Officer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Buses
              </CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹89,204</div>
              <p className="text-xs text-muted-foreground">
                +₹14,000 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Usage</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,204 L</div>
              <p className="text-xs text-muted-foreground">
                -50 L from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 urgent, 1 routine
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Active Routes</CardTitle>
                <CardDescription>
                  Current bus assignments and status
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#">
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
                  <TableRow>
                    <TableCell className="font-medium">KA-01-F-1234</TableCell>
                    <TableCell>Bangalore - Mysore</TableCell>
                    <TableCell>Rajesh Kumar</TableCell>
                    <TableCell>
                      <Badge variant="default">On Time</Badge>
                    </TableCell>
                    <TableCell className="text-right">14:30</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">KA-02-G-5678</TableCell>
                    <TableCell>Hubli - Dharwad</TableCell>
                    <TableCell>Suresh Patel</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Delayed</Badge>
                    </TableCell>
                    <TableCell className="text-right">15:45</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">KA-03-H-9012</TableCell>
                    <TableCell>Mangalore - Udupi</TableCell>
                    <TableCell>Priya Singh</TableCell>
                    <TableCell>
                      <Badge variant="default">On Time</Badge>
                    </TableCell>
                    <TableCell className="text-right">16:15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">KA-04-J-3456</TableCell>
                    <TableCell>Belgaum - Bijapur</TableCell>
                    <TableCell>Arun Desai</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Breakdown</Badge>
                    </TableCell>
                    <TableCell className="text-right">N/A</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">KA-05-K-7890</TableCell>
                    <TableCell>Shimoga - Chikmagalur</TableCell>
                    <TableCell>Meera Reddy</TableCell>
                    <TableCell>
                      <Badge variant="default">On Time</Badge>
                    </TableCell>
                    <TableCell className="text-right">17:30</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Rajesh Kumar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">On Duty</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Suresh Patel
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">On Duty</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>PS</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Priya Singh
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">On Duty</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Arun Desai
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">Off Duty</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Meera Reddy
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Driver
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">On Duty</Badge>
              </div>
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
                  <TableRow>
                    <TableCell>KA-01-F-1234</TableCell>
                    <TableCell>Oil Change</TableCell>
                    <TableCell>2023-07-15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>KA-02-G-5678</TableCell>
                    <TableCell>Tire Rotation</TableCell>
                    <TableCell>2023-07-18</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>KA-03-H-9012</TableCell>
                    <TableCell>Brake Inspection</TableCell>
                    <TableCell>2023-07-20</TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell>Normal</TableCell>
                    <TableCell>5.2 km/L</TableCell>
                    <TableCell>
                      <Badge>Good</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sleeper</TableCell>
                    <TableCell>4.8 km/L</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Average</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Multi-Axle</TableCell>
                    <TableCell>4.5 km/L</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Poor</Badge>
                    </TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell>Bangalore - Mysore</TableCell>
                    <TableCell>₹15,000</TableCell>
                    <TableCell>85%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Hubli - Dharwad</TableCell>
                    <TableCell>₹8,500</TableCell>
                    <TableCell>70%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mangalore - Udupi</TableCell>
                    <TableCell>₹12,000</TableCell>
                    <TableCell>90%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}