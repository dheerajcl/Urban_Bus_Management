
import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg max-w-md w-full">
        <Dialog.Title className="text-xl font-bold mb-4 text-black">Book Seats</Dialog.Title>
        <Dialog.Description className="mb-4 text-gray-700">
          Please enter the number of seats and your email for reminders.
        </Dialog.Description>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Number of Seats</label>
          <Input
            type="number"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            min={1}
            max={availableSeats}
            className="w-full p-2 border border-gray-300 rounded text-black bg-white"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Email (for reminders)</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-black bg-white"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Passenger Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-black bg-white"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="ghost" onClick={onClose} className="text-black bg-gray-200">Cancel</Button>
          <Button onClick={handleBook} className="text-white bg-blue-500">Book</Button>
        </div>
        <Dialog.Close asChild>
          <button className="absolute top-2 right-2 text-gray-700">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default BookingModal