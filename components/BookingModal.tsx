'use client'

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"

type BookingModalProps = {
  busId: number
  availableSeats: number
  onClose: () => void
  onBook: (busId: number, seats: number, email: string, name: string) => Promise<void>
}

const BookingModal: React.FC<BookingModalProps> = ({ busId, availableSeats, onClose, onBook }) => {
  const { toast } = useToast()
  const [seats, setSeats] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    seats?: string
    email?: string
    name?: string
  }>({})

  const validateForm = () => {
    const newErrors: {
      seats?: string
      email?: string
      name?: string
    } = {}

    if (seats <= 0 || seats > availableSeats) {
      newErrors.seats = `Please select between 1 and ${availableSeats} seats`
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!name.trim()) {
      newErrors.name = 'Please enter passenger name'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBook = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onBook(busId, seats, email, name)
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'An error occurred while booking. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-zinc-800">
          <Dialog.Title className="text-2xl font-bold mb-4 text-white">Book Your Seats</Dialog.Title>
          <Dialog.Description className="mb-6 text-zinc-400">
            Please enter the number of seats and your details for booking.
          </Dialog.Description>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seats" className="text-sm font-medium text-zinc-200">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                min={1}
                max={availableSeats}
                className={cn(
                  "w-full bg-zinc-800 border-zinc-700 text-white",
                  errors.seats && "border-red-500"
                )}
              />
              {errors.seats && (
                <p className="text-sm text-red-500 mt-1">{errors.seats}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full bg-zinc-800 border-zinc-700 text-white",
                  errors.email && "border-red-500"
                )}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-200">Passenger Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "w-full bg-zinc-800 border-zinc-700 text-white",
                  errors.name && "border-red-500"
                )}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBook} 
              className="bg-green-500 text-white hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Now'
              )}
            </Button>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-white rounded-full p-1"
              aria-label="Close"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BookingModal