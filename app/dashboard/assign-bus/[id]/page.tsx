'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Stop = {
  id: number
  stop_name: string
  stop_order: number
}

type Route = {
  id: number
  name: string
  source: string
  destination: string
  stops: Stop[]
}

type Bus = {
  id: number
  bus_number: string
}

type BusAssignment = {
  bus_id: number
  departure_time: string
  arrival_time: string
  price: number
  available_seats: number
  distances: { from_stop: string; to_stop: string; distance_km: number }[]
}

export default function AssignBusPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [route, setRoute] = useState<Route | null>(null)
  const [availableBuses, setAvailableBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [busAssignment, setBusAssignment] = useState<BusAssignment>({
    bus_id: 0,
    departure_time: '',
    arrival_time: '',
    price: 0,
    available_seats: 0,
    distances: []
  })

  const fetchRouteDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/routes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch route details')
      }
      const data = await response.json()
      setRoute(data)
      setBusAssignment(prev => ({
        ...prev,
        distances: data.stops.slice(0, -1).map((stop: Stop, index: number) => ({
          from_stop: stop.stop_name,
          to_stop: data.stops[index + 1].stop_name,
          distance_km: 0
        }))
      }))
    } catch (error) {
      console.error('Error fetching route details:', error)
      toast({
        title: "Error",
        description: "Failed to fetch route details. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast]) // Include 'id' and 'toast' as dependencies

  const fetchAvailableBuses = useCallback(async () => {
    try {
      const response = await fetch('/api/available-buses')
      if (!response.ok) {
        throw new Error('Failed to fetch available buses')
      }
      const data = await response.json()
      setAvailableBuses(data)
    } catch (error) {
      console.error('Error fetching available buses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch available buses. Please try again later.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchRouteDetails()
    fetchAvailableBuses()
  }, [fetchRouteDetails, fetchAvailableBuses])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/assign-bus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route_id: id,
          ...busAssignment
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to assign bus')
      }
      toast({
        title: "Success",
        description: "Bus assigned successfully",
      })
      router.push('/dashboard/routes')
    } catch (error) {
      console.error('Error assigning bus:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!route) {
    return <div>Route not found</div>
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Assign Bus to Route: {route.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bus_id">Bus</Label>
                <Select
                  value={busAssignment.bus_id.toString()}
                  onValueChange={(value) => setBusAssignment({ ...busAssignment, bus_id: parseInt(value) })}
                >
                  <SelectTrigger id="bus_id">
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.bus_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="departure_time">Departure Time</Label>
                <Input
                  id="departure_time"
                  type="datetime-local"
                  value={busAssignment.departure_time}
                  onChange={(e) => setBusAssignment({ ...busAssignment, departure_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="arrival_time">Arrival Time</Label>
                <Input
                  id="arrival_time"
                  type="datetime-local"
                  value={busAssignment.arrival_time}
                  onChange={(e) => setBusAssignment({ ...busAssignment, arrival_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={busAssignment.price}
                  onChange={(e) => setBusAssignment({ ...busAssignment, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="available_seats">Available Seats</Label>
                <Input
                  id="available_seats"
                  type="number"
                  value={busAssignment.available_seats}
                  onChange={(e) => setBusAssignment({ ...busAssignment, available_seats: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Distances between stops</h3>
              {busAssignment.distances.map((distance, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <span>{distance.from_stop} to {distance.to_stop}:</span>
                  <Input
                    type="number"
                    value={distance.distance_km}
                    onChange={(e) => {
                      const newDistances = [...busAssignment.distances]
                      newDistances[index].distance_km = parseFloat(e.target.value)
                      setBusAssignment({ ...busAssignment, distances: newDistances })
                    }}
                    placeholder="Distance in km"
                    className="w-32"
                    required
                  />
                  <span>km</span>
                </div>
              ))}
            </div>
            <Button type="submit">Assign Bus</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}