'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Bus, RefreshCw } from 'lucide-react'
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const TimeInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const [hours, minutes] = value.split(':').map(Number)

  return (
    <div className="flex space-x-2">
      <Select
        value={hours.toString().padStart(2, '0')}
        onValueChange={(newHour) => {
          onChange(`${newHour.padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, i) => (
            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
              {i.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-2xl">:</span>
      <Select
        value={minutes.toString().padStart(2, '0')}
        onValueChange={(newMinute) => {
          onChange(`${hours.toString().padStart(2, '0')}:${newMinute}`)
        }}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => (
            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
              {i.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


export type Stop = {
  id?: number
  stop_name: string
  stop_order: number
}

export type ScheduleInfo = {
  is_assigned: boolean
  bus_number: string | null
  departure_time: string | null
  arrival_time: string | null
}

export type Route = {
  id: number
  name: string
  source: string
  destination: string
  operator_id: number
  stops: Stop[]
  schedule_info: ScheduleInfo | null
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

export default function RoutesPage() {
  const { toast } = useToast()
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignBusDialogOpen, setIsAssignBusDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id' | 'schedule_info'>>({
    name: '',
    source: '',
    destination: '',
    operator_id: 1,
    stops: []
  })
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [assigningRoute, setAssigningRoute] = useState<Route | null>(null)
  const [availableBuses, setAvailableBuses] = useState<Bus[]>([])
  const [busAssignment, setBusAssignment] = useState<BusAssignment>({
    bus_id: 0,
    departure_time: '',
    arrival_time: '',
    price: 0,
    available_seats: 0,
    distances: []
  })

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/routes')
      if (!response.ok) {
        throw new Error('Failed to fetch routes')
      }
      const data = await response.json()
      setRoutes(data)
      toast({
        title: "Success",
        description: "Routes loaded successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      })
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch routes. Please try again later.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  const fetchAvailableBuses = async () => {
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
  }

  const fetchCurrentAssignment = async (routeId: number) => {
    try {
      const response = await fetch(`/api/bus-assignment/${routeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch current assignment')
      }
      const data = await response.json()
      setBusAssignment(data)
    } catch (error) {
      console.error('Error fetching current assignment:', error)
      toast({
        title: "Error",
        description: "Failed to fetch current assignment. Please try again later.",
        variant: "destructive",
      })
    }
  }


  const handleAddRoute = async () => {
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoute),
      });
      if (!response.ok) {
        throw new Error('Failed to add route');
      }
      const addedRoute = await response.json();
      setRoutes([...routes, addedRoute]);
      setIsAddDialogOpen(false);
      setNewRoute({
        name: '',
        source: '',
        destination: '',
        operator_id: 1,
        stops: [],
      });
      toast({
        title: "Success",
        description: "Route added successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error adding route:', error);
      toast({
        title: "Error",
        description: "Failed to add route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const handleEditRoute = async () => {
    if (!editingRoute) return;
    try {
      const response = await fetch('/api/routes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRoute),
      });
      if (!response.ok) {
        throw new Error('Failed to update route');
      }
      const updatedRoute = await response.json();
      setRoutes(routes.map(route => route.id === updatedRoute.id ? updatedRoute : route));
      setIsEditDialogOpen(false);
      setEditingRoute(null);
      toast({
        title: "Success",
        description: "Route updated successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const handleDeleteRoute = async (id: number) => {
    try {
      const response = await fetch(`/api/routes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete route');
      }
      setRoutes(routes.filter(route => route.id !== id));
      toast({
        title: "Success",
        description: "Route deleted successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const handleAssignBus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningRoute) return

    try {
      const url = assigningRoute.schedule_info?.is_assigned ? '/api/reassign-bus' : '/api/assign-bus'
      const method = assigningRoute.schedule_info?.is_assigned ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route_id: assigningRoute.id,
          ...busAssignment
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to assign/reassign bus')
      }

      toast({
        title: "Success",
        description: `Bus ${assigningRoute.schedule_info?.is_assigned ? 're' : ''}assigned successfully`,
      })

      setIsAssignBusDialogOpen(false)
      loadRoutes()
    } catch (error) {
      console.error('Error assigning/reassigning bus:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign/reassign bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openAssignBusDialog = (route: Route) => {
    setAssigningRoute(route)
    fetchAvailableBuses()
    if (route.schedule_info?.is_assigned) {
      fetchCurrentAssignment(route.id)
    } else {
      setBusAssignment({
        bus_id: 0,
        departure_time: '',
        arrival_time: '',
        price: 0,
        available_seats: 0,
        distances: route.stops.slice(0, -1).map((stop, index) => ({
          from_stop: stop.stop_name,
          to_stop: route.stops[index + 1].stop_name,
          distance_km: 0
        }))
      })
    }
    setIsAssignBusDialogOpen(true)
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Route Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Route
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Route</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newRoute.name}
                      onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">
                      Source
                    </Label>
                    <Input
                      id="source"
                      value={newRoute.source}
                      onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="destination" className="text-right">
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      value={newRoute.destination}
                      onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stops" className="text-right">
                      Stops
                    </Label>
                    <div className="col-span-3 space-y-2">
                      {newRoute.stops.map((stop, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={stop.stop_name}
                            onChange={(e) => {
                              const updatedStops = [...newRoute.stops];
                              updatedStops[index].stop_name = e.target.value;
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                            placeholder="Stop name"
                          />
                          <Input
                            type="number"
                            value={stop.stop_order}
                            onChange={(e) => {
                              const updatedStops = [...newRoute.stops];
                              updatedStops[index].stop_order = parseInt(e.target.value);
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                            placeholder="Order"
                            className="w-20"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedStops = newRoute.stops.filter((_, i) => i !== index);
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => setNewRoute({
                          ...newRoute,
                          stops: [...newRoute.stops, { stop_name: '', stop_order: newRoute.stops.length + 1 }]
                        })}
                      >
                        Add Stop
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddRoute}>Add Route</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Bus Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.source}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.stops.length}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingRoute(route)
                          setIsEditDialogOpen(true)
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {route.schedule_info && route.schedule_info.is_assigned ? (
                        <div className="flex items-center space-x-2">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium cursor-pointer">
                                Bus Assigned
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">Assigned Bus Details</h4>
                                  <p className="text-sm">Bus Number: {route.schedule_info.bus_number || 'N/A'}</p>
                                  <p className="text-sm">
                                    Departure: {route.schedule_info.departure_time 
                                      ? new Date(route.schedule_info.departure_time).toLocaleString() 
                                      : 'N/A'}
                                  </p>
                                  <p className="text-sm">
                                    Arrival: {route.schedule_info.arrival_time 
                                      ? new Date(route.schedule_info.arrival_time).toLocaleString() 
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <Button variant="outline" size="sm" onClick={() => openAssignBusDialog(route)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reassign Bus
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => openAssignBusDialog(route)}>
                          <Bus className="h-4 w-4 mr-2" />
                          Assign Bus
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Assign/Reassign Bus Dialog */}
      <Dialog open={isAssignBusDialogOpen} onOpenChange={setIsAssignBusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{assigningRoute?.schedule_info?.is_assigned ? 'Reassign' : 'Assign'} Bus to Route: {assigningRoute?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignBus} className="space-y-4">
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
              <div className="space-y-2">
                <Label>Departure</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !busAssignment.departure_time && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {busAssignment.departure_time ? format(new Date(busAssignment.departure_time), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={busAssignment.departure_time ? new Date(busAssignment.departure_time) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentTime = busAssignment.departure_time
                            ? new Date(busAssignment.departure_time)
                            : new Date()
                          date.setHours(currentTime.getHours(), currentTime.getMinutes())
                          setBusAssignment({ ...busAssignment, departure_time: date.toISOString() })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <TimeInput
                    value={busAssignment.departure_time ? format(new Date(busAssignment.departure_time), "HH:mm") : "00:00"}
                    onChange={(time) => {
                      const [hours, minutes] = time.split(':').map(Number)
                      const newDate = busAssignment.departure_time
                        ? new Date(busAssignment.departure_time)
                        : new Date()
                      newDate.setHours(hours, minutes)
                      setBusAssignment({ ...busAssignment, departure_time: newDate.toISOString() })
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arrival</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !busAssignment.arrival_time && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {busAssignment.arrival_time ? format(new Date(busAssignment.arrival_time), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={busAssignment.arrival_time ? new Date(busAssignment.arrival_time) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentTime = busAssignment.arrival_time
                            ? new Date(busAssignment.arrival_time)
                            : new Date()
                          date.setHours(currentTime.getHours(), currentTime.getMinutes())
                          setBusAssignment({ ...busAssignment, arrival_time: date.toISOString() })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <TimeInput
                    value={busAssignment.arrival_time ? format(new Date(busAssignment.arrival_time), "HH:mm") : "00:00"}
                    onChange={(time) => {
                      const [hours, minutes] = time.split(':').map(Number)
                      const newDate = busAssignment.arrival_time
                        ? new Date(busAssignment.arrival_time)
                        : new Date()
                      newDate.setHours(hours, minutes)
                      setBusAssignment({ ...busAssignment, arrival_time: newDate.toISOString() })
                    }}
                  />
                </div>
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
                  onChange={(e) => setBusAssignment({ 
                    ...busAssignment,
                    available_seats: parseInt(e.target.value)
                  })}
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
            <DialogFooter>
              <Button type="submit">{assigningRoute?.schedule_info?.is_assigned ? 'Reassign' : 'Assign'} Bus</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingRoute.name}
                  onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-source" className="text-right">
                  Source
                </Label>
                <Input
                  id="edit-source"
                  value={editingRoute.source}
                  onChange={(e) => setEditingRoute({ ...editingRoute, source: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-destination" className="text-right">
                  Destination
                </Label>
                <Input
                  id="edit-destination"
                  value={editingRoute.destination}
                  onChange={(e) => setEditingRoute({ ...editingRoute, destination: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stops" className="text-right">
                  Stops
                </Label>
                <div className="col-span-3 space-y-2">
                  {editingRoute.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={stop.stop_name}
                        onChange={(e) => {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_name = e.target.value;
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                        placeholder="Stop name"
                      />
                      <Input
                        type="number"
                        value={stop.stop_order}
                        onChange={(e) => {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_order = parseInt(e.target.value);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                        placeholder="Order"
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedStops = editingRoute.stops.filter((_, i) => i !== index);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => setEditingRoute({
                      ...editingRoute,
                      stops: [...editingRoute.stops, { stop_name: '', stop_order: editingRoute.stops.length + 1 }]
                    })}
                  >
                    Add Stop
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditRoute}>Update Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}