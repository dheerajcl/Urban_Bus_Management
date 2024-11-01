'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type BusResult = {
  id: number
  type: string
  price: string
  capacity: number
  departure_time: string
  arrival_time: string
  route_name: string
  available_seats: number
}

export default function LandingPage() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<Date>()
  const [busResults, setBusResults] = useState<BusResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!source || !destination || !date) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchAttempted(true);

    const searchParams = new URLSearchParams({
      source,
      destination,
      date: format(date, 'yyyy-MM-dd')
    })

    try {
      const response = await fetch(`/api/search-buses?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bus results')
      }
      const data = await response.json()
      setBusResults(data)
    } catch (error) {
      console.error('Search buses error:', error)
      setError('An error occurred while searching for buses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Bus className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Swift Commute</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">Admin Login</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden py-20">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/background2.jpeg"
              alt="Urban cityscape with buses"
              layout="fill"
              objectFit="cover"
              className="opacity-30"
            />
          </div>
          <div className="relative z-10 text-center px-4 w-full max-w-6xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            >
              Your Journey, Reimagined
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl mb-12 text-muted-foreground"
            >
              Experience city travel like never before
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-4xl mx-auto"
            >
              <Card className="bg-card/80 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="From"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="pl-10 bg-input border-input"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="To"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 bg-input border-input"
                      />
                    </div>
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </span>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" /> Search Buses
                        </>
                      )}
                    </Button>
                  </form>
                  {error && (
                    <p className="mt-4 text-red-500 text-center">{error}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {busResults.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="py-24 bg-background"
            >
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-16 text-center text-foreground">Available Buses</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {busResults.map((bus) => (
                    <motion.div
                      key={bus.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center text-foreground">
                            <Bus className="mr-2 h-5 w-5 text-primary" />
                            {bus.type} Bus
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center mb-2 text-foreground">
                            <CreditCard className="mr-2 h-4 w-4 text-primary" />
                            <span>Price: ₹{bus.price}</span>
                          </div>
                          <div className="flex items-center mb-2 text-foreground">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            <span>Available Seats: {bus.available_seats}/{bus.capacity}</span>
                          </div>
                          <div className="flex items-center mb-2 text-foreground">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span>Departure: {new Date(bus.departure_time).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center mb-2 text-foreground">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span>Arrival: {new Date(bus.arrival_time).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center text-foreground">
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            <span>{bus.route_name}</span>
                          </div>
                          <Button className="w-full mt-4">Book Now</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {busResults.length === 0 && !isLoading && searchAttempted && (
            <section className="py-24 bg-background">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold mb-4 text-foreground">No buses found</h2>
                <p className="text-muted-foreground">Try adjusting your search criteria or selecting a different date.</p>
              </div>
            </section>
          )}

      </main>

      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground">Contact Us</h3>
              <p className="text-muted-foreground mb-2">Email: info@swiftcommute.com</p>
              <p className="text-muted-foreground">Phone: +1 (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground">Follow Us</h3>
              <div className="flex space-x-6">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Facebook</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Instagram</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Swift Commute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}