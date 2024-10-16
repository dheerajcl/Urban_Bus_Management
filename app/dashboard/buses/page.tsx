'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react'
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

type Bus = {
  id: string
  number: string
  type: string
  capacity: number
  status: 'Active' | 'Maintenance' | 'Out of Service'
  last_maintenance: string
  fuel_efficiency: number
  description: string
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBus, setNewBus] = useState<Omit<Bus, 'id'>>({
    number: '',
    type: 'Standard',
    capacity: 40,
    status: 'Active',
    last_maintenance: '',
    fuel_efficiency: 0,
    description: ''
  })

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/buses')
      if (!response.ok) {
        throw new Error('Failed to fetch buses')
      }
      const data = await response.json()
      setBuses(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching buses:', error)
      setError('Failed to fetch buses. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBus = async () => {
    try {
      const response = await fetch('/api/buses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBus),
      })
      if (!response.ok) {
        throw new Error('Failed to add bus')
      }
      const addedBus = await response.json()
      setBuses([...buses, addedBus])
      setIsAddDialogOpen(false)
      setNewBus({
        number: '',
        type: 'Standard',
        capacity: 40,
        status: 'Active',
        last_maintenance: '',
        fuel_efficiency: 0,
        description: ''
      })
    } catch (error) {
      console.error('Error adding bus:', error)
      setError('Failed to add bus. Please try again.')
    }
  }

  const handleDeleteBus = async (id: string) => {
    try {
      const response = await fetch('/api/buses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete bus')
      }
      setBuses(buses.filter(bus => bus.id !== id))
    } catch (error) {
      console.error('Error deleting bus:', error)
      setError('Failed to delete bus. Please try again.')
    }
  }

  const filteredBuses = buses.filter(bus =>
    bus.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Loading buses...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bus Management</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search buses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Bus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="busNumber">Bus Number</Label>
                  <Input
                    id="busNumber"
                    value={newBus.number}
                    onChange={(e) => setNewBus({ ...newBus, number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="busType">Type</Label>
                  <Select
                    value={newBus.type}
                    onValueChange={(value) => setNewBus({ ...newBus, type: value })}
                  >
                    <SelectTrigger id="busType">
                      <SelectValue placeholder="Select bus type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Mini">Mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="busCapacity">Capacity</Label>
                  <Input
                    id="busCapacity"
                    type="number"
                    value={newBus.capacity}
                    onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="busStatus">Status</Label>
                  <Select
                    value={newBus.status}
                    onValueChange={(value: 'Active' | 'Maintenance' | 'Out of Service') => setNewBus({ ...newBus, status: value })}
                  >
                    <SelectTrigger id="busStatus">
                      <SelectValue placeholder="Select bus status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Out of Service">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={newBus.last_maintenance}
                  onChange={(e) => setNewBus({ ...newBus, last_maintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fuelEfficiency">Fuel Efficiency (km/L)</Label>
                <Input
                  id="fuelEfficiency"
                  type="number"
                  step="0.1"
                  value={newBus.fuel_efficiency}
                  onChange={(e) => setNewBus({ ...newBus, fuel_efficiency: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBus.description}
                  onChange={(e) => setNewBus({ ...newBus, description: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddBus}>Add Bus</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bus Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Fuel Efficiency</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBuses.map((bus) => (
            <TableRow key={bus.id}>
              <TableCell>{bus.number}</TableCell>
              <TableCell>{bus.type}</TableCell>
              <TableCell>{bus.capacity}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  bus.status === 'Active' ? 'bg-green-100 text-green-800' :
                  bus.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {bus.status === 'Maintenance' && <AlertTriangle className="mr-1 h-3 w-3" />}
                  {bus.status}
                </span>
              </TableCell>
              <TableCell>{bus.last_maintenance}</TableCell>
              <TableCell>{bus.fuel_efficiency} km/L</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteBus(bus.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}