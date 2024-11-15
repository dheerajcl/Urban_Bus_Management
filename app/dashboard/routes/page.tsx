'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Bus, RefreshCw, X } from 'lucide-react'
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
  DialogTrigger,
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

export type ScheduleInfo = {
  is_assigned: boolean
  bus_number: string | null
  departure: string | null
  arrival: string | null
}

export type Stop = {
  id?: number
  stop_name: string
  stop_order: number
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
  bus_id: number;
  departure: string | null;
  arrival: string | null;
  available_seats: number;
  distances: Array<{
    from_stop: string;
    to_stop: string;
    distance_km: number;
  }>;
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
    departure: null,
    arrival: null,
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
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch routes. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  const fetchAvailableBuses = async (currentBusId?: number) => {
    try {
      const response = await fetch(`/api/available-buses${currentBusId ? `?currentBusId=${currentBusId}` : ''}`)
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
      setBusAssignment({
        bus_id: data.bus_id,
        departure: data.departure,
        arrival: data.arrival,
        available_seats: data.available_seats,
        distances: data.distances
      })
      // Fetch available buses including the currently assigned bus
      await fetchAvailableBuses(data.bus_id)
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
      });
    } catch (error) {
      console.error('Error adding route:', error);
      toast({
        title: "Error",
        description: "Failed to add route. Please try again.",
        variant: "destructive",
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
      });
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
        variant: "destructive",
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
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
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

  const openAssignBusDialog = async (route: Route) => {
    setAssigningRoute(route)
    if (route.schedule_info?.is_assigned) {
      await fetchCurrentAssignment(route.id)
    } else {
      setBusAssignment({
        bus_id: 0,
        departure: null,
        arrival: null,
        available_seats: 0,
        distances: route.stops.slice(0, -1).map((stop, index) => ({
          from_stop: stop.stop_name,
          to_stop: route.stops[index + 1].stop_name,
          distance_km: 0
        }))
      })
      await fetchAvailableBuses()
    }
    setIsAssignBusDialogOpen(true)
  }

  const handleDeassignBus = async (routeId: number) => {
    try {
      const response = await fetch(`/api/deassign-bus/${routeId}`, {
        method: 'DELETE',
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to de-assign bus')
      }
  
      toast({
        title: "Success",
        description: "Bus de-assigned successfully",
      })
  
      loadRoutes()
    } catch (error) {
      console.error('Error de-assigning bus:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to de-assign bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDateTimeChange = (field: 'departure' | 'arrival', value: string) => {
    setBusAssignment(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Route Management</h1>
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
                <Label htmlFor="stops" className="text-right">Stops</Label>
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
      <div className="border rounded-md">
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-background">Name</TableHead>
                <TableHead className="sticky top-0 bg-background">Source</TableHead>
                <TableHead className="sticky top-0 bg-background">Destination</TableHead>
                <TableHead className="sticky top-0 bg-background">Stops</TableHead>
                <TableHead className="sticky top-0 bg-background">Actions</TableHead>
                <TableHead className="sticky top-0 bg-background">Bus Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredRoutes.map((route) => (
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
                          <Trash2 className="h-4 w-4 text-red-500" />
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
                              </div>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="mt-2 w-full"
                                onClick={() => handleDeassignBus(route.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                De-assign Bus
                              </Button>
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stops" className="text-right">Stops</Label>
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
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditRoute}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  value={busAssignment.bus_id.toString()}
                  onValueChange={(value) => setBusAssignment({ ...busAssignment, bus_id: parseInt(value) })}
                >
                  <SelectTrigger id="bus_id" className="w-full">
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.bus_number} {bus.id === busAssignment.bus_id ? '(Currently Assigned)' : ''}
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
                  onChange={(e) => handleDateTimeChange('departure', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Arrival</Label>
                <Input
                  type="datetime-local"
                  value={busAssignment.arrival || ''}
                  onChange={(e) => handleDateTimeChange('arrival', e.target.value)}
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Distances between stops</h3>
              <div className="grid gap-4 max-h-[200px] overflow-y-auto pr-2">
                {/* {busAssignment.distances.map((distance, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <Input
                      value={distance.from_stop}
                      onChange={(e) => {
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].from_stop = e.target.value;
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      placeholder="From Stop"
                    />
                    <Input
                      value={distance.to_stop}
                      onChange={(e) => {
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].to_stop = e.target.value;
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      placeholder="To Stop"
                    />
                    <Input
                      type="number"
                      value={distance.distance_km}
                      onChange={(e) => {
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].distance_km = parseFloat(e.target.value);
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      placeholder="Distance (km)"
                    />
                  </div>
                ))} */}

                {busAssignment.distances.map((distance, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center">
                    <Input
                      value={distance.from_stop}
                      onChange={(e) => {
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].from_stop = e.target.value;
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      placeholder="From Stop"
                    />
                    <Input
                      value={distance.to_stop}
                      onChange={(e) => {
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].to_stop = e.target.value;
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      placeholder="To Stop"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={distance.distance_km}
                      onChange={(e) => {
                        const newValue = Math.max(0, parseFloat(e.target.value) || 0);
                        const newDistances = [...busAssignment.distances];
                        newDistances[index].distance_km = newValue;
                        setBusAssignment({ ...busAssignment, distances: newDistances });
                      }}
                      onBlur={(e) => {
                        if (parseFloat(e.target.value) < 0) {
                          const newDistances = [...busAssignment.distances];
                          newDistances[index].distance_km = 0;
                          setBusAssignment({ ...busAssignment, distances: newDistances });
                          toast({
                            title: "Invalid Distance",
                            description: "Distance cannot be negative. Value set to 0.",
                            variant: "destructive",
                          });
                        }
                      }}
                      placeholder="Distance (km)"
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {assigningRoute?.schedule_info?.is_assigned ? 'Reassign' : 'Assign'} Bus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}