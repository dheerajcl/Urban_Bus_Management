'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

type Booking = {
  id: number
  route_name: string
  departure_time: string
  arrival_time: string
  seats_booked: number
  total_price: string | number | null
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/user/bookings')
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
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user, toast])

  const formatPrice = (price: string | number | null): string => {
    if (price === null) return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? 'N/A' : `₹${numPrice.toFixed(2)}`
  }

  // if (!user) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
  //       <p className="text-xl">Please log in to view your dashboard.</p>
  //     </div>
  //   )
  // }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <div className="flex-1 ml-24 mr-24 p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, !</h1>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Your Bookings</CardTitle>
            <CardDescription className="text-zinc-400">Here are your recent bus bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-zinc-300">Route</TableHead>
                  <TableHead className="text-zinc-300">Departure</TableHead>
                  <TableHead className="text-zinc-300">Arrival</TableHead>
                  <TableHead className="text-zinc-300">Seats</TableHead>
                  <TableHead className="text-zinc-300">Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="text-zinc-100">{booking.route_name}</TableCell>
                    <TableCell className="text-zinc-100">{new Date(booking.departure_time).toLocaleString()}</TableCell>
                    <TableCell className="text-zinc-100">{new Date(booking.arrival_time).toLocaleString()}</TableCell>
                    <TableCell className="text-zinc-100">{booking.seats_booked}</TableCell>
                    <TableCell className="text-zinc-100">
                      {formatPrice(booking.total_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}