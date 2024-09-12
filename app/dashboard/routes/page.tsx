'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, MapPin, Clock, DollarSign, Fuel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Stop = {
  id: string
  name: string
  arrivalTime: string
  departureTime: string
}

type Route = {
  id: string
  number: string
  startPoint: string
  endPoint: string
  busNumber: string
  driverName: string
  stops: Stop[]
  fuelConsumption: number
  revenueProbability: number
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      number: 'R001',
      startPoint: 'Central Station',
      endPoint: 'Airport',
      busNumber: 'BUS001',
      driverName: 'John Doe',
      stops: [
        { id: 's1', name: 'Downtown', arrivalTime: '10:15 AM', departureTime: '10:20 AM' },
        { id: 's2', name: 'Suburb Center', arrivalTime: '10:45 AM', departureTime: '10:50 AM' },
      ],
      fuelConsumption: 25.5,
      revenueProbability: 85,
    },
    // Add more mock routes here
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    number: '',
    startPoint: '',
    endPoint: '',
    busNumber: '',
    driverName: '',
    stops: [],
    fuelConsumption: 0,
    revenueProbability: 0,
  })

  const handleAddRoute = () => {
    const id = (routes.length + 1).toString()
    setRoutes([...routes, { ...newRoute, id }])
    setIsAddDialogOpen(false)
    setNewRoute({
      number: '',
      startPoint: '',
      endPoint: '',
      busNumber: '',
      driverName: '',
      stops: [],
      fuelConsumption: 0,
      revenueProbability: 0,
    })
  }

  const handleDeleteRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id))
  }

  const filteredRoutes = routes.filter(route =>
    route.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routeNumber">Route Number</Label>
                  <Input
                    id="routeNumber"
                    value={newRoute.number}
                    onChange={(e) => setNewRoute({ ...newRoute, number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="busNumber">Bus Number</Label>
                  <Input
                    id="busNumber"
                    value={newRoute.busNumber}
                    onChange={(e) => setNewRoute({ ...newRoute, busNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startPoint">Start Point</Label>
                  <Input
                    id="startPoint"
                    value={newRoute.startPoint}
                    onChange={(e) => setNewRoute({ ...newRoute, startPoint: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endPoint">End Point</Label>
                  <Input
                    id="endPoint"
                    value={newRoute.endPoint}
                    onChange={(e) => setNewRoute({ ...newRoute, endPoint: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={newRoute.driverName}
                  onChange={(e) => setNewRoute({ ...newRoute, driverName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stops">Stops (one per line: name,arrivalTime,departureTime)</Label>
                <Textarea
                  id="stops"
                  rows={3}
                  onChange={(e) => {
                    const stopsArray = e.target.value.split('\n').map((stop, index) => {
                      const [name, arrivalTime, departureTime] = stop.split(',')
                      return { id: `s${index + 1}`, name, arrivalTime, departureTime }
                    })
                    setNewRoute({ ...newRoute, stops: stopsArray })
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuelConsumption">Fuel Consumption (L/100km)</Label>
                  <Input
                    id="fuelConsumption"
                    type="number"
                    value={newRoute.fuelConsumption}
                    onChange={(e) => setNewRoute({ ...newRoute, fuelConsumption: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="revenueProbability">Revenue Probability (%)</Label>
                  <Input
                    id="revenueProbability"
                    type="number"
                    value={newRoute.revenueProbability}
                    onChange={(e) => setNewRoute({ ...newRoute, revenueProbability: parseFloat(e.target.value) })}
                  />
                </div>
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
                <span>Route {route.number}: {route.startPoint} to {route.endPoint}</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Bus Number: {route.busNumber}</p>
                  <p>Driver: {route.driverName}</p>
                </div>
                <div>
                  <p className="flex items-center"><Fuel className="mr-2 h-4 w-4" /> Fuel Consumption: {route.fuelConsumption} L/100km</p>
                  <p className="flex items-center"><DollarSign className="mr-2 h-4 w-4" /> Revenue Probability: {route.revenueProbability}%</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Stops:</h4>
                <ul className="space-y-2">
                  {route.stops.map((stop) => (
                    <li key={stop.id} className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{stop.name}</span>
                      <Clock className="ml-4 mr-2 h-4 w-4" />
                      <span>{stop.arrivalTime} - {stop.departureTime}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}