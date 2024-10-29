'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, MapPin, Clock} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchRoutes, addRoute, updateRoute, deleteRoute } from '@/lib/api'

export type Stop = {
  id: number
  stop_name: string
  stop_order: number
}

export type Route = {
  id: number
  name: string
  source: string
  destination: string
  bus_id: number
  bus_number: string
  stops: Stop[]
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    name: '',
    source: '',
    destination: '',
    bus_id: 0,
    bus_number: '',
    stops: []
  })
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    try {
      setLoading(true)
      const fetchedRoutes = await fetchRoutes()
      setRoutes(fetchedRoutes)
      setError(null)
    } catch (error) {
      console.error('Error fetching routes:', error)
      setError('Failed to fetch routes. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoute = async () => {
    try {
      const addedRoute = await addRoute(newRoute)
      setRoutes([...routes, addedRoute])
      setIsAddDialogOpen(false)
      setNewRoute({
        name: '',
        source: '',
        destination: '',
        bus_id: 0,
        bus_number: '',
        stops: []
      })
    } catch (error) {
      console.error('Error adding route:', error)
      setError('Failed to add route. Please try again.')
    }
  }

  const handleEditRoute = async () => {
    if (!editingRoute) return
    try {
      const updatedRoute = await updateRoute(editingRoute.id, editingRoute)
      setRoutes(routes.map(route => route.id === updatedRoute.id ? updatedRoute : route))
      setIsEditDialogOpen(false)
      setEditingRoute(null)
    } catch (error) {
      console.error('Error updating route:', error)
      setError('Failed to update route. Please try again.')
    }
  }

  const handleDeleteRoute = async (id: number) => {
    try {
      await deleteRoute(id)
      setRoutes(routes.filter(route => route.id !== id))
    } catch (error) {
      console.error('Error deleting route:', error)
      setError('Failed to delete route. Please try again.')
    }
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Loading routes...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newRoute.source}
                    onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="busNumber">Bus Number</Label>
                <Input
                  id="busNumber"
                  value={newRoute.bus_number}
                  onChange={(e) => setNewRoute({ ...newRoute, bus_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stops">Stops (one per line: name,order)</Label>
                <Textarea
                  id="stops"
                  rows={3}
                  onChange={(e) => {
                    const stopsArray = e.target.value.split('\n').map((stop, index) => {
                      const [stop_name, stop_order] = stop.split(',')
                      return { id: index + 1, stop_name, stop_order: parseInt(stop_order) }
                    })
                    setNewRoute({ ...newRoute, stops: stopsArray })
                  }}
                />
              </div>
            </div>
            <Button onClick={handleAddRoute}>Add Route</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-6">
        {filteredRoutes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Route {route.name}: {route.source} to {route.destination}</span>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold">Bus Number: {route.bus_number}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Stops:</h4>
                <ul className="space-y-2">
                  {route.stops.map((stop) => (
                    <li key={stop.id} className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{stop.stop_name}</span>
                      <Clock className="ml-4 mr-2 h-4 w-4" />
                      <span>Order: {stop.stop_order}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editRouteName">Route Name</Label>
                <Input
                  id="editRouteName"
                  value={editingRoute.name}
                  onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editSource">Source</Label>
                  <Input
                    id="editSource"
                    value={editingRoute.source}
                    onChange={(e) => setEditingRoute({ ...editingRoute, source: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editDestination">Destination</Label>
                  <Input
                    id="editDestination"
                    value={editingRoute.destination}
                    onChange={(e) => setEditingRoute({ ...editingRoute, destination: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editBusNumber">Bus Number</Label>
                <Input
                  id="editBusNumber"
                  value={editingRoute.bus_number}
                  onChange={(e) => setEditingRoute({ ...editingRoute, bus_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editStops">Stops (one per line: name,order)</Label>
                <Textarea
                  id="editStops"
                  rows={3}
                  value={editingRoute.stops.map(stop => `${stop.stop_name},${stop.stop_order}`).join('\n')}
                  onChange={(e) => {
                    const stopsArray = e.target.value.split('\n').map((stop, index) => {
                      const [stop_name, stop_order] = stop.split(',')
                      return { id: index + 1, stop_name, stop_order: parseInt(stop_order) }
                    })
                    setEditingRoute({ ...editingRoute, stops: stopsArray })
                  }}
                />
              </div>
            </div>
          )}
          <Button onClick={handleEditRoute}>Update Route</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}