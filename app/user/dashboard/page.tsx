'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader } from "lucide-react"
import { getUserEmail } from "@/lib/userStore"

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

  if (!userEmail) {
    router.push('/user/login')
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <Loader className="animate-spin mr-2" size={24} />
        <p>Loading your bookings...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <div className="flex-1 ml-24 mr-24 p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
        <p className="text-zinc-400 mb-8">Email: {userEmail}</p>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Your Bookings</CardTitle>
            <CardDescription className="text-zinc-400">Here are your recent bus bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-zinc-400">You have no bookings yet.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}