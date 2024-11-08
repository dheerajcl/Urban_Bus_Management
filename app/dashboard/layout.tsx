'use client'

import Link from "next/link"
import { useRouter, usePathname } from 'next/navigation'
import { Bus, CircleUser, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
    }
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  const isActive = (path: string) => pathname === path

  if (!user) {
    return null // or a loading spinner
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
            className={`transition-colors hover:text-primary ${
              isActive('/dashboard') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/buses"
            className={`transition-colors hover:text-primary ${
              isActive('/dashboard/buses') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            Buses
          </Link>
          <Link
            href="/dashboard/routes"
            className={`transition-colors hover:text-primary ${
              isActive('/dashboard/routes') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            Routes
          </Link>
          <Link
            href="/dashboard/staff"
            className={`transition-colors hover:text-primary ${
              isActive('/dashboard/staff') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            Staff
          </Link>
          <Link
            href="/dashboard/reports"
            className={`transition-colors hover:text-primary ${
              isActive('/dashboard/reports') ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
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
              <Link
                href="/dashboard"
                className={`hover:text-primary ${
                  isActive('/dashboard') ? 'text-primary font-semibold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/buses"
                className={`hover:text-primary ${
                  isActive('/dashboard/buses') ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Buses
              </Link>
              <Link
                href="/dashboard/routes"
                className={`hover:text-primary ${
                  isActive('/dashboard/routes') ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Routes
              </Link>
              <Link
                href="/dashboard/staff"
                className={`hover:text-primary ${
                  isActive('/dashboard/staff') ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Staff
              </Link>
              <Link
                href="/dashboard/reports"
                className={`hover:text-primary ${
                  isActive('/dashboard/reports') ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Reports
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          {/* <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search buses, routes, staff..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form> */}
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.role}</DropdownMenuLabel>
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
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}