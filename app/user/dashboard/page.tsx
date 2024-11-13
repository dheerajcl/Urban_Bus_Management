'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader, LogOut } from "lucide-react"
import { getUserEmail, clearUserEmail } from "@/lib/userStore"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Booking = {
  id: number
  route_name: string
  departure: string
  arrival: string
  seats_booked: number
  total_price: string | number | null
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const userEmail = getUserEmail()

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userEmail) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/bookings?email=${encodeURIComponent(userEmail)}`)
        if (!response.ok) throw new Error('Failed to fetch bookings')
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast, userEmail])

  const formatPrice = (price: string | number | null): string => {
    if (price === null) return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? 'N/A' : `₹${numPrice.toFixed(2)}`
  }

  const handleLogout = () => {
    clearUserEmail()
    router.push('/')
  }

  if (!userEmail) {
    router.push('/user/login')
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader className="animate-spin mr-2" size={24} />
        <p>Loading your bookings...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userEmail}`} />
              <AvatarFallback>{userEmail.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>{userEmail}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>Here are your recent bus bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">You have no bookings yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.route_name}</TableCell>
                      <TableCell>{new Date(booking.departure).toLocaleString()}</TableCell>
                      <TableCell>{new Date(booking.arrival).toLocaleString()}</TableCell>
                      <TableCell>{booking.seats_booked}</TableCell>
                      <TableCell>{formatPrice(booking.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}