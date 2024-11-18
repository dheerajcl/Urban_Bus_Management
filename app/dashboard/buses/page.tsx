'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Bus = {
  id: number
  operator_id: number
  bus_number: string
  type: string
  capacity: number
  last_maintenance: string
  next_maintenance: string
  staff_assigned: boolean
  base_fare: number
  per_km_rate: number
  per_stop_rate: number
  mileage: number
}

type StaffMember = {
  id: number
  name: string
  role_name: string
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignStaffDialogOpen, setIsAssignStaffDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staffLoading, setStaffLoading] = useState(false)
  const [newBus, setNewBus] = useState<Omit<Bus, 'id' | 'staff_assigned'>>({
    operator_id: 1,
    bus_number: '',
    type: 'Express',
    capacity: 40,
    last_maintenance: '',
    next_maintenance: '',
    base_fare: 0,
    per_km_rate: 0,
    per_stop_rate: 0,
    mileage: 0 
  })
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)

  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])
  const [staffAssignment, setStaffAssignment] = useState({
    driverId: '',
    conductorId: '',
    cleanerId: ''
  })

  const [assignmentError, setAssignmentError] = useState('')

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchAvailableStaff = async (busId?: number) => {
    try {
      setStaffLoading(true)
      const response = await fetch(`/api/available-staff${busId ? `?busId=${busId}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch available staff')
      const data = await response.json()
      setAvailableStaff(data)
    } catch (error) {
      console.error('Error fetching available staff:', error)
      setAssignmentError('Failed to fetch available staff')
    } finally {
      setStaffLoading(false)
    }
  }

  const fetchCurrentAssignments = async (busId: number) => {
    try {
      const response = await fetch(`/api/bus-assignments?busId=${busId}`)
      if (!response.ok) throw new Error('Failed to fetch current assignments')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching current assignments:', error)
      return null
    }
  }

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
        operator_id: 1,
        bus_number: '',
        type: 'Express',
        capacity: 40,
        last_maintenance: '',
        next_maintenance: '',
        base_fare: 0,
        per_km_rate: 0,
        per_stop_rate: 0,
        mileage: 0 
      })
      toast({
        title: "Success",
        description: "Bus added successfully",
        className: "bg-green-700 text-white p-2 text-sm",
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
        className: "bg-green-700 text-white p-2 text-sm",
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
        className: "bg-green-700 text-white p-2 text-sm",
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

  const openAssignStaffDialog = async (bus: Bus) => {
    setSelectedBus(bus)
    setIsAssignStaffDialogOpen(true)
    setStaffLoading(true)
    
    try {
      const currentAssignments = await fetchCurrentAssignments(bus.id)
      await fetchAvailableStaff(bus.id)

      if (currentAssignments?.currentAssignments) {
        setStaffAssignment({
          driverId: currentAssignments.currentAssignments.driver_id?.toString() || '',
          conductorId: currentAssignments.currentAssignments.conductor_id?.toString() || '',
          cleanerId: currentAssignments.currentAssignments.cleaner_id?.toString() || ''
        })
      }
    } catch (error) {
      console.error('Error in openAssignStaffDialog:', error)
      setAssignmentError('Failed to load assignments')
    } finally {
      setStaffLoading(false)
    }
  }

  const availableDrivers = availableStaff.filter(s => s.role_name === 'Driver')
  const availableConductors = availableStaff.filter(s => s.role_name === 'Conductor')
  const availableCleaners = availableStaff.filter(s => s.role_name === 'Cleaner')

  const handleAssignStaff = async () => {
    try {
      setAssignmentError('')
      const response = await fetch('/api/assign-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busId: selectedBus?.id,
          driverId: parseInt(staffAssignment.driverId),
          conductorId: parseInt(staffAssignment.conductorId),
          cleanerId: staffAssignment.cleanerId ? parseInt(staffAssignment.cleanerId) : null
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
      await response.json()
      setBuses(buses.map(bus => 
        bus.id === selectedBus?.id ? { ...bus, staff_assigned: true } : bus
      ))
      setIsAssignStaffDialogOpen(false)
      toast({
        title: "Success",
        description: "Staff assigned successfully",
        className: "bg-green-700 text-white p-2 text-sm",
      })
    } catch (error) {
      if (error instanceof Error) {
        setAssignmentError(error.message)
      } else {
        setAssignmentError('An unexpected error occurred')
      }
    }
  }

  const filteredBuses = buses.filter(bus =>
    bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bus Management</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead>Staff Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (error) {
    return <div className="p-6">Error: {error}</div>
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black shadow-lg rounded-md">
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="busNumber">Bus Number</Label>
                <Input
                  id="busNumber"
                  value={newBus.bus_number}
                  onChange={(e) => setNewBus({ ...newBus, bus_number: e.target.value })}
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
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Sleeper">Sleeper</SelectItem>
                    <SelectItem value="Volvo">Volvo</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                    <SelectItem value="Mini-bus">Mini-bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="busMileage">Mileage</Label>
                <Input
                  id="busMileage"
                  type="number"
                  step="0.1"
                  value={newBus.mileage}
                  onChange={(e) => setNewBus({ ...newBus, mileage: parseFloat(e.target.value) })}
                />
              </div>
                <div>
                <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={newBus.last_maintenance}
                  onChange={(e) => setNewBus({ ...newBus, last_maintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={newBus.next_maintenance}
                  onChange={(e) => setNewBus({ ...newBus, next_maintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="baseFare">Base Fare</Label>
                <Input
                  id="baseFare"
                  type="number"
                  value={newBus.base_fare}
                  onChange={(e) => setNewBus({ ...newBus, base_fare: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="perKmRate">Per Km Rate</Label>
                <Input
                  id="perKmRate"
                  type="number"
                  value={newBus.per_km_rate}
                  onChange={(e) => setNewBus({ ...newBus, per_km_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="perStopRate">Per Stop Rate</Label>
                <Input
                  id="perStopRate"
                  type="number"
                  value={newBus.per_stop_rate}
                  onChange={(e) => setNewBus({ ...newBus, per_stop_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBus}>Add Bus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bus Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead>Staff Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBuses.map((bus) => (
            <TableRow key={bus.id}>
              <TableCell>{bus.bus_number}</TableCell>
              <TableCell>{bus.type}</TableCell>
              <TableCell>{bus.capacity}</TableCell>
              <TableCell>
              {(bus.mileage || bus.mileage === 0) 
                ? `${Number(bus.mileage).toFixed(2)} kmpl` 
                : 'N/A'}
              </TableCell>
              <TableCell>{new Date(bus.last_maintenance).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(bus.next_maintenance).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  bus.staff_assigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {bus.staff_assigned ? 'Assigned' : 'Not Assigned'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingBus(bus)
                    setIsEditDialogOpen(true)
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteBus(bus.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignStaffDialog(bus)}
                  >
                    {bus.staff_assigned ? "Reassign Staff" : "Assign Staff"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black shadow-lg rounded-md">
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          {editingBus && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editBusNumber">Bus Number</Label>
                <Input
                  id="editBusNumber"
                  value={editingBus.bus_number}
                  onChange={(e) => setEditingBus({...editingBus, bus_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editBusType">Type</Label>
                <Select
                  value={editingBus.type}
                  onValueChange={(value) => setEditingBus({ ...editingBus, type: value })}
                >
                  <SelectTrigger id="editBusType">
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
              <div>
                <Label htmlFor="editBusCapacity">Capacity</Label>
                <Input
                  id="editBusCapacity"
                  type="number"
                  value={editingBus.capacity}
                  onChange={(e) => setEditingBus({ ...editingBus, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="editBusMileage">Mileage</Label>
                <Input
                  id="editBusMileage"
                  type="number"
                  step="0.01"
                  value={editingBus.mileage}
                  onChange={(e) => setEditingBus({ ...editingBus, mileage: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="editLastMaintenance">Last Maintenance</Label>
                <Input
                  id="editLastMaintenance"
                  type="date"
                  value={editingBus.last_maintenance}
                  onChange={(e) => setEditingBus({ ...editingBus, last_maintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editNextMaintenance">Next Maintenance</Label>
                <Input
                  id="editNextMaintenance"
                  type="date"
                  value={editingBus.next_maintenance}
                  onChange={(e) => setEditingBus({ ...editingBus, next_maintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editBaseFare">Base Fare</Label>
                <Input
                  id="editBaseFare"
                  type="number"
                  value={editingBus.base_fare}
                  onChange={(e) => setEditingBus({ ...editingBus, base_fare: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="editPerKmRate">Per Km Rate</Label>
                <Input
                  id="editPerKmRate"
                  type="number"
                  value={editingBus.per_km_rate}
                  onChange={(e) => setEditingBus({ ...editingBus, per_km_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="editPerStopRate">Per Stop Rate</Label>
                <Input
                  id="editPerStopRate"
                  type="number"
                  value={editingBus.per_stop_rate}
                  onChange={(e) => setEditingBus({ ...editingBus, per_stop_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditBus}>Update Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignStaffDialogOpen} onOpenChange={setIsAssignStaffDialogOpen}>
        <DialogContent className="bg-black shadow-lg rounded-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBus?.staff_assigned ? 'Reassign' : 'Assign'} Staff to Bus {selectedBus?.bus_number}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {staffLoading ? (
              <div>Loading staff...</div>
            ) : (
              <>
                <div>
                  <Label htmlFor="driverId">Driver</Label>
                  <Select
                    value={staffAssignment.driverId}
                    onValueChange={(value) => setStaffAssignment({ ...staffAssignment, driverId: value })}
                  >
                    <SelectTrigger id="driverId">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="conductorId">Conductor</Label>
                  <Select
                    value={staffAssignment.conductorId}
                    onValueChange={(value) => setStaffAssignment({ ...staffAssignment, conductorId: value })}
                  >
                    <SelectTrigger id="conductorId">
                      <SelectValue placeholder="Select a conductor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConductors.map((conductor) => (
                        <SelectItem key={conductor.id} value={conductor.id.toString()}>
                          {conductor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cleanerId">Cleaner (Optional)</Label>
                  <Select
                    value={staffAssignment.cleanerId}
                    onValueChange={(value) => setStaffAssignment({ ...staffAssignment, cleanerId: value })}
                  >
                    <SelectTrigger id="cleanerId">
                      <SelectValue placeholder="Select a cleaner" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCleaners.map((cleaner) => (
                        <SelectItem key={cleaner.id} value={cleaner.id.toString()}>
                          {cleaner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          {assignmentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{assignmentError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button onClick={handleAssignStaff} disabled={staffLoading}>Assign Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}