'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Bus, Search, CircleUser, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = () => {
    // Implement logout logic here
    // For now, we'll just redirect to the login page
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Bus className="h-6 w-6" />
          </Link>
          <Link
            href="/dashboard"
            className="text-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/buses"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Buses
          </Link>
          <Link
            href="/dashboard/routes"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Routes
          </Link>
          <Link
            href="/dashboard/staff"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Staff
          </Link>
          <Link
            href="/dashboard/reports"
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
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Bus className="h-6 w-6" />
                <span>Urban Bus Management</span>
              </Link>
              <Link href="/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <Link
                href="/dashboard/buses"
                className="text-muted-foreground hover:text-primary"
              >
                Buses
              </Link>
              <Link
                href="/dashboard/routes"
                className="text-muted-foreground hover:text-primary"
              >
                Routes
              </Link>
              <Link
                href="/dashboard/staff"
                className="text-muted-foreground hover:text-primary"
              >
                Staff
              </Link>
              <Link
                href="/dashboard/reports"
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
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}