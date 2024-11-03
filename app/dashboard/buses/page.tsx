'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Bus = {
  id: number
  operator_id: number
  bus_number: string
  type: string
  capacity: number
  last_maintenance: string
  next_maintenance: string
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newBus, setNewBus] = useState<Omit<Bus, 'id'>>({
    operator_id: 1, // Default operator ID, adjust as needed
    bus_number: '',
    type: 'Express',
    capacity: 40,
    last_maintenance: '',
    next_maintenance: ''
  })
  const [editingBus, setEditingBus] = useState<Bus | null>(null)

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
    } catch (error) {
      console.error('Error fetching buses:', error)
      toast({
        title: "Error",
        description: "Failed to fetch buses. Please try again later.",
        variant: "destructive",
      })
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
        operator_id: 1,
        bus_number: '',
        type: 'Express',
        capacity: 40,
        last_maintenance: '',
        next_maintenance: ''
      })
      toast({
        title: "Success",
        description: "Bus added successfully",
      })
    } catch (error) {
      console.error('Error adding bus:', error)
      toast({
        title: "Error",
        description: "Failed to add bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditBus = async () => {
    if (!editingBus) return
    try {
      const response = await fetch('/api/buses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingBus),
      })
      if (!response.ok) {
        throw new Error('Failed to update bus')
      }
      const updatedBus = await response.json()
      setBuses(buses.map(bus => bus.id === updatedBus.id ? updatedBus : bus))
      setIsEditDialogOpen(false)
      setEditingBus(null)
      toast({
        title: "Success",
        description: "Bus updated successfully",
      })
    } catch (error) {
      console.error('Error updating bus:', error)
      toast({
        title: "Error",
        description: "Failed to update bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBus = async (id: number) => {
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
      toast({
        title: "Success",
        description: "Bus deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting bus:', error)
      toast({
        title: "Error",
        description: "Failed to delete bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredBuses = buses.filter(bus =>
    bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Bus Management</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="busNumber" className="text-right">Bus Number</Label>
                    <Input
                      id="busNumber"
                      value={newBus.bus_number}
                      onChange={(e) => setNewBus({ ...newBus, bus_number: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="busType" className="text-right">Type</Label>
                    <Select
                      value={newBus.type}
                      onValueChange={(value) => setNewBus({ ...newBus, type: value })}
                    >
                      <SelectTrigger id="busType" className="col-span-3">
                        <SelectValue placeholder="Select bus type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Sleeper">Sleeper</SelectItem>
                        <SelectItem value="Volvo">Volvo</SelectItem>
                        <SelectItem value="Luxury">Luxury</SelectItem>
                        <SelectItem value="Mini-bus">Mini-bus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="busCapacity" className="text-right">Capacity</Label>
                    <Input
                      id="busCapacity"
                      type="number"
                      value={newBus.capacity}
                      onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastMaintenance" className="text-right">Last Maintenance</Label>
                    <Input
                      id="lastMaintenance"
                      type="date"
                      value={newBus.last_maintenance}
                      onChange={(e) => setNewBus({ ...newBus, last_maintenance: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nextMaintenance" className="text-right">Next Maintenance</Label>
                    <Input
                      id="nextMaintenance"
                      type="date"
                      value={newBus.next_maintenance}
                      onChange={(e) => setNewBus({ ...newBus, next_maintenance: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBus}>Add Bus</Button>
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
                  <TableHead>Bus Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell>{bus.bus_number}</TableCell>
                    <TableCell>{bus.type}</TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                    <TableCell>{new Date(bus.last_maintenance).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(bus.next_maintenance).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingBus(bus)
                          setIsEditDialogOpen(true)
                        }}>
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
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          {editingBus && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBusNumber" className="text-right">Bus Number</Label>
                <Input
                  id="editBusNumber"
                  value={editingBus.bus_number}
                  onChange={(e) => setEditingBus({ ...editingBus, bus_number: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBusType" className="text-right">Type</Label>
                <Select
                  value={editingBus.type}
                  onValueChange={(value) => setEditingBus({ ...editingBus, type: value })}
                >
                  <SelectTrigger id="editBusType" className="col-span-3">
                    <SelectValue placeholder="Select bus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Sleeper">Sleeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBusCapacity" className="text-right">Capacity</Label>
                <Input
                  id="editBusCapacity"
                  type="number"
                  value={editingBus.capacity}
                  onChange={(e) => setEditingBus({ ...editingBus, capacity: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLastMaintenance" className="text-right">Last Maintenance</Label>
                <Input
                  id="editLastMaintenance"
                  type="date"
                  value={editingBus.last_maintenance}
                  onChange={(e) => setEditingBus({ ...editingBus, last_maintenance: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNextMaintenance" className="text-right">Next Maintenance</Label>
                <Input
                  id="editNextMaintenance"
                  type="date"
                  value={editingBus.next_maintenance}
                  onChange={(e) => setEditingBus({ ...editingBus, next_maintenance: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button  onClick={handleEditBus}>Update Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}