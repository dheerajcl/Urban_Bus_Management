'use client'

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type BookingModalProps = {
  busId: number
  availableSeats: number
  onClose: () => void
  onBook: (busId: number, seats: number, email: string, name: string) => void
}

const BookingModal: React.FC<BookingModalProps> = ({ busId, availableSeats, onClose, onBook }) => {
  const [seats, setSeats] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleBook = () => {
    if (seats > 0 && seats <= availableSeats) {
      onBook(busId, seats, email, name)
    } else {
      alert('Invalid number of seats')
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
                className="w-full bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border-zinc-700 text-white"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-200">Passenger Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border-zinc-700 text-white"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleBook} className="bg-green-500 text-white hover:bg-green-600">
              Book Now
            </Button>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-zinc-400 hover:text-white rounded-full p-1"
              aria-label="Close"
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