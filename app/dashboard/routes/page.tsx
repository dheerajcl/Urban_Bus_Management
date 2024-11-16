'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Bus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type Stop = {
  id?: number
  stop_name: string
  stop_order: number
}

type Distance = {
  from_stop: string
  to_stop: string
  distance_km: number
}

type ScheduleInfo = {
  is_assigned: boolean
  bus_id?: number
  bus_number?: string
  departure?: string
  arrival?: string
}

type Route = {
  id: number
  name: string
  source: string
  destination: string
  operator_id: number
  stops: Stop[]
  distances: Distance[]
  schedule_info?: ScheduleInfo
}

type Bus = {
  id: number
  bus_number: string
  capacity: number
}

type BusAssignment = {
  bus_id: number
  departure: string | null
  arrival: string | null
  available_seats: number
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
    stops: [],
    distances: []
  })
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [assigningRoute, setAssigningRoute] = useState<Route | null>(null)
  const [availableBuses, setAvailableBuses] = useState<Bus[]>([])
  const [busAssignment, setBusAssignment] = useState<BusAssignment>({
    bus_id: 0,
    departure: null,
    arrival: null,
    available_seats: 0
  })
  const [stopForm, setStopForm] = useState({ from: '', to: '', distance: '' })

  const loadRoutes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/routes')
      if (!response.ok) {
        throw new Error('Failed to fetch routes')
      }
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error('Error loading routes:', error)
      toast({
        title: "Error",
        description: "Failed to load routes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  const handleAddRoute = async () => {
    try {
      // Add source as the first stop
      const updatedStops = [
        { stop_name: newRoute.source, stop_order: 1 },
        ...newRoute.stops.map((stop, index) => ({ ...stop, stop_order: index + 2 }))
      ]
      
      const routeToAdd = {
        ...newRoute,
        stops: updatedStops,
      }

      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeToAdd),
      })
      if (!response.ok) {
        throw new Error('Failed to add route')
      }
      const addedRoute = await response.json()
      setRoutes([...routes, addedRoute])
      setIsAddDialogOpen(false)
      setNewRoute({
        name: '',
        source: '',
        destination: '',
        operator_id: 1,
        stops: [],
        distances: [],
      })
      setStopForm({ from: '', to: '', distance: '' })
      toast({
        title: "Success",
        description: "Route added successfully",
      })
    } catch (error) {
      console.error('Error adding route:', error)
      toast({
        title: "Error",
        description: "Failed to add route. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddStop = () => {
    if (!stopForm.from || !stopForm.to || !stopForm.distance) {
      toast({
        title: "Error",
        description: "Please fill in all stop details",
        variant: "destructive",
      })
      return
    }
    const newStop = { stop_name: stopForm.to, stop_order: newRoute.stops.length + 2 } // +2 because source is the first stop
    const newDistance = { from_stop: stopForm.from, to_stop: stopForm.to, distance_km: parseFloat(stopForm.distance) }
    setNewRoute(prevRoute => ({
      ...prevRoute,
      stops: [...prevRoute.stops, newStop],
      distances: [...prevRoute.distances, newDistance]
    }))
    setStopForm({ from: stopForm.to, to: '', distance: '' })
  }


  const handleEditRoute = async () => {
    if (!editingRoute) return
    try {
      const response = await fetch('/api/routes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRoute),
      })
      if (!response.ok) {
        throw new Error('Failed to update route')
      }
      const updatedRoute = await response.json()
      setRoutes(routes.map(route => route.id === updatedRoute.id ? updatedRoute : route))
      setIsEditDialogOpen(false)
      setEditingRoute(null)
      toast({
        title: "Success",
        description: "Route updated successfully",
      })
    } catch (error) {
      console.error('Error updating route:', error)
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRoute = async (id: number) => {
    try {
      const response = await fetch(`/api/routes?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete route')
      }
      setRoutes(routes.filter(route => route.id !== id))
      toast({
        title: "Success",
        description: "Route deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting route:', error)
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  const handleDeassignBus = async (routeId: number) => {
    try {
      const response = await fetch(`/api/deassign-bus?routeId=${routeId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to deassign bus')
      }

      toast({
        title: "Success",
        description: "Bus deassigned successfully",
      })

      loadRoutes()
    } catch (error) {
      console.error('Error deassigning bus:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deassign bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openAssignBusDialog = async (route: Route) => {
    setAssigningRoute(route)
    try {
      if (route.schedule_info?.is_assigned) {
        await fetchCurrentAssignment(route.id)
      } else {
        setBusAssignment({
          bus_id: 0,
          departure: null,
          arrival: null,
          available_seats: 0
        })
      }
      await fetchAvailableBuses(route.id)
      setIsAssignBusDialogOpen(true)
    } catch (error) {
      console.error('Error opening assign bus dialog:', error)
      toast({
        title: "Error",
        description: "Failed to load current assignments. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchAvailableBuses = async (routeId: number) => {
    try {
      const response = await fetch(`/api/available-buses?routeId=${routeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch available buses')
      }
      const buses = await response.json()
      // Remove duplicates based on bus id
      const uniqueBuses = buses.filter((bus: Bus, index: number, self: Bus[]) =>
        index === self.findIndex((t) => t.id === bus.id)
      )
      setAvailableBuses(uniqueBuses)
    } catch (error) {
      console.error('Error fetching available buses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch available buses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchCurrentAssignment = async (routeId: number) => {
    try {
      const response = await fetch(`/api/current-assignment?routeId=${routeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch current assignment')
      }
      const currentAssignment = await response.json()
      setBusAssignment(currentAssignment)
    } catch (error) {
      console.error('Error fetching current assignment:', error)
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch current assignment. Please try again.",
      //   variant: "destructive",
      // })
    }
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Route Management</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Add New Route
        </Button>
      </div>
      
      {/* Routes Table */}
      <div className="border rounded-md">
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Bus Assignment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.source}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingRoute(route)
                          setIsEditDialogOpen(true)
                        }}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
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
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold">Assigned Bus Details</h4>
                                <p className="text-sm">Bus Number: {route.schedule_info.bus_number || 'N/A'}</p>
                                <p className="text-sm">
                                  Departure: {route.schedule_info.departure
                                    ? format(new Date(route.schedule_info.departure), "PPP 'at' p")
                                    : 'N/A'}
                                </p>
                                <p className="text-sm">
                                  Arrival: {route.schedule_info.arrival
                                    ? format(new Date(route.schedule_info.arrival), "PPP 'at' p")
                                    : 'N/A'}
                                </p>
                                <Button variant="outline" size="sm" onClick={() => handleDeassignBus(route.id)}>
                                  Deassign Bus
                                </Button>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newRoute.name}
                onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">Source</Label>
              <Input
                id="source"
                value={newRoute.source}
                onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="destination" className="text-right">Destination</Label>
              <Input
                id="destination"
                value={newRoute.destination}
                onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">From</Label>
              <Input
                id="from"
                value={stopForm.from}
                onChange={(e) => setStopForm({ ...stopForm, from: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">To</Label>
              <Input
                id="to"
                value={stopForm.to}
                onChange={(e) => setStopForm({ ...stopForm, to: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                value={stopForm.distance}
                onChange={(e) => setStopForm({ ...stopForm, distance: e.target.value })}
                className="col-span-3"
              />
            </div>
            <Button onClick={handleAddStop}>Add Stop</Button>
            <div>
              <h4 className="font-semibold mb-2">Added Stops:</h4>
              <ul className="list-disc pl-5">
                {newRoute.stops.map((stop, index) => (
                  <li key={index}>{stop.stop_name}</li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddRoute}>Finish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editingRoute?.name || ''}
                onChange={(e) => setEditingRoute(editingRoute ? { ...editingRoute, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-source" className="text-right">Source</Label>
              <Input
                id="edit-source"
                value={editingRoute?.source || ''}
                onChange={(e) => setEditingRoute(editingRoute ? { ...editingRoute, source: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-destination" className="text-right">Destination</Label>
              <Input
                id="edit-destination"
                value={editingRoute?.destination || ''}
                onChange={(e) => setEditingRoute(editingRoute ? { ...editingRoute, destination: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-stops" className="text-right pt-2">Stops</Label>
              <div className="col-span-3 space-y-2">
                {editingRoute?.stops.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={stop.stop_name}
                      onChange={(e) => {
                        if (editingRoute) {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_name = e.target.value;
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }
                      }}
                      placeholder="Stop name"
                    />
                    <Input
                      type="number"
                      value={stop.stop_order}
                      onChange={(e) => {
                        if (editingRoute) {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_order = parseInt(e.target.value);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }
                      }}
                      placeholder="Order"
                      className="w-20"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (editingRoute) {
                          const updatedStops = editingRoute.stops.filter((_, i) => i !== index);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    if (editingRoute) {
                      setEditingRoute({
                        ...editingRoute,
                        stops: [...editingRoute.stops, { stop_name: '', stop_order: editingRoute.stops.length + 1 }]
                      });
                    }
                  }}
                >
                  Add Stop
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-distances" className="text-right pt-2">Distances</Label>
              <div className="col-span-3 space-y-2">
                {editingRoute?.distances.map((distance, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={distance.from_stop}
                      onChange={(e) => {
                        if (editingRoute) {
                          const updatedDistances = [...editingRoute.distances];
                          updatedDistances[index].from_stop = e.target.value;
                          setEditingRoute({ ...editingRoute, distances: updatedDistances });
                        }
                      }}
                      placeholder="From stop"
                    />
                    <Input
                      value={distance.to_stop}
                      onChange={(e) => {
                        if (editingRoute) {
                          const updatedDistances = [...editingRoute.distances];
                          updatedDistances[index].to_stop = e.target.value;
                          setEditingRoute({ ...editingRoute, distances: updatedDistances });
                        }
                      }}
                      placeholder="To stop"
                    />
                    <Input
                      type="number"
                      value={distance.distance_km}
                      onChange={(e) => {
                        if (editingRoute) {
                          const updatedDistances = [...editingRoute.distances];
                          updatedDistances[index].distance_km = parseFloat(e.target.value);
                          setEditingRoute({ ...editingRoute, distances: updatedDistances });
                        }
                      }}
                      placeholder="Distance (km)"
                      className="w-24"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (editingRoute) {
                          const updatedDistances = editingRoute.distances.filter((_, i) => i !== index);
                          setEditingRoute({ ...editingRoute, distances: updatedDistances });
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    if (editingRoute) {
                      setEditingRoute({
                        ...editingRoute,
                        distances: [...editingRoute.distances, { from_stop: '', to_stop: '', distance_km: 0 }]
                      });
                    }
                  }}
                >
                  Add Distance
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditRoute}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign/Reassign Bus Dialog */}
      <Dialog open={isAssignBusDialogOpen} onOpenChange={setIsAssignBusDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {assigningRoute?.schedule_info?.is_assigned ? 'Reassign' : 'Assign'} Bus to Route: {assigningRoute?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignBus} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bus_id">Bus</Label>
                <Select
                  value={busAssignment.bus_id.toString() || ''}
                  onValueChange={(value) => setBusAssignment({ ...busAssignment, bus_id: parseInt(value) })}
                >
                  <SelectTrigger id="bus_id" className="w-full">
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.bus_number} {bus.id === assigningRoute?.schedule_info?.bus_id ? '(Currently Assigned)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Departure</Label>
                <Input
                  type="datetime-local"
                  value={busAssignment.departure || ''}
                  onChange={(e) => setBusAssignment({ ...busAssignment, departure: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Arrival</Label>
                <Input
                  type="datetime-local"
                  value={busAssignment.arrival || ''}
                  onChange={(e) => setBusAssignment({ ...busAssignment, arrival: e.target.value })}
                />
              </div>
              <div className="space-y-2">
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
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {assigningRoute?.schedule_info?.is_assigned ? 'Reassign' : 'Assign'} Bus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}