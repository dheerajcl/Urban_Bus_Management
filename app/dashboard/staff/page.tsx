'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Phone } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Staff = {
  id: number
  name: string
  contact_number: string
  license_number: string | null
  employment_date: string
  role_name: string
  work_rate: number | null
  operator_id: number
}

type Role = {
  id: number
  role_name: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStaff, setNewStaff] = useState<Omit<Staff, 'id' | 'role_name' | 'work_rate'>>({
    name: '',
    contact_number: '',
    license_number: null,
    employment_date: '',
    operator_id: 1 // Assuming operator_id is required and set to 1 for now
  })
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [selectedRole, setSelectedRole] = useState<number | null>(null)

  useEffect(() => {
    fetchStaff()
    fetchRoles()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }
      const data = await response.json()
      setStaff(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('Failed to fetch staff. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      setError('Failed to fetch roles. Please try again later.')
    }
  }

  const handleAddStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newStaff, role_id: selectedRole }),
      })
      if (!response.ok) {
        throw new Error('Failed to add staff')
      }
      const addedStaff = await response.json()
      setStaff([...staff, addedStaff])
      setIsAddDialogOpen(false)
      setNewStaff({
        name: '',
        contact_number: '',
        license_number: null,
        employment_date: '',
        operator_id: 1 // Reset operator_id to 1 for now
      })
      setSelectedRole(null)
    } catch (error) {
      console.error('Error adding staff:', error)
      setError('Failed to add staff. Please try again.')
    }
  }

  const handleEditStaff = async () => {
    if (!editingStaff) return
    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editingStaff, role_id: selectedRole }),
      })
      if (!response.ok) {
        throw new Error('Failed to update staff')
      }
      const updatedStaff = await response.json()
      setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s))
      setIsEditDialogOpen(false)
      setEditingStaff(null)
      setSelectedRole(null)
    } catch (error) {
      console.error('Error updating staff:', error)
      setError('Failed to update staff. Please try again.')
    }
  }

  const handleDeleteStaff = async (id: number) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete staff')
      }
      setStaff(staff.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting staff:', error)
      setError('Failed to delete staff. Please try again.')
    }
  }

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.license_number && s.license_number.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Staff Management</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Phone Number</TableHead>
              {/* <TableHead>Work Rate</TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
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
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="staffName">Name</Label>
                <Input
                  id="staffName"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={newStaff.contact_number}
                  onChange={(e) => setNewStaff({ ...newStaff, contact_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={newStaff.license_number || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, license_number: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="employmentDate">Employment Date</Label>
                <Input
                  id="employmentDate"
                  type="date"
                  value={newStaff.employment_date}
                  onChange={(e) => setNewStaff({ ...newStaff, employment_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => setSelectedRole(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>License Number</TableHead>
            <TableHead>Phone Number</TableHead>
            {/* <TableHead>Work Rate</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaff.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.role_name}</TableCell>
              <TableCell>{s.license_number || 'N/A'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <a href={`tel:${s.contact_number}`}>
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </a>
                  <span>{s.contact_number}</span>
                </div>
              </TableCell>
              {/* <TableCell>{typeof s.work_rate === 'number' ? s.work_rate.toFixed(2) : '0.00'}%</TableCell> */}
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingStaff(s)
                    setIsEditDialogOpen(true)
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(s.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editStaffName">Name</Label>
                <Input
                  id="editStaffName"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editContactNumber">Contact Number</Label>
                <Input
                  id="editContactNumber"
                  value={editingStaff.contact_number}
                  onChange={(e) => setEditingStaff({ ...editingStaff, contact_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editLicenseNumber">License Number</Label>
                <Input
                  id="editLicenseNumber"
                  value={editingStaff.license_number || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, license_number: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="editEmploymentDate">Employment Date</Label>
                <Input
                  id="editEmploymentDate"
                  type="date"
                  value={editingStaff.employment_date}
                  onChange={(e) => setEditingStaff({ ...editingStaff, employment_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select onValueChange={(value) => setSelectedRole(Number(value))} value={selectedRole?.toString() || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <Button onClick={handleEditStaff}>Update Staff</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}