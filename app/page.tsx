'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, MapPin, Calendar, Shield, Wifi, Coffee, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar as MainCalendar} from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type BusResult = {
  id: number
  type: string
  price: string
  capacity: number
  departureTime: string
}

export default function LandingPage() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<Date>()
  const [busResults, setBusResults] = useState<BusResult[]>([])
  const [userLocation, setUserLocation] = useState<string | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setUserLocation(`Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)}`)
      })
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would be an API call
    const mockResults: BusResult[] = [
      { id: 1, type: 'Express', price: '₹500', capacity: 40, departureTime: '10:00 AM' },
      { id: 2, type: 'Deluxe', price: '₹750', capacity: 35, departureTime: '11:30 AM' },
      { id: 3, type: 'Sleeper', price: '₹1000', capacity: 30, departureTime: '09:00 PM' },
    ]
    setBusResults(mockResults)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Bus className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Swift Commute</span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <Image
            src="/images/background2.jpeg"
            alt="Urban cityscape with buses at night"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0"
          />
          <div className="absolute inset-0 bg-black/60 z-1"></div>
          <div className="relative z-2 text-center px-4 w-full max-w-6xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-7xl mb-6 text-primary"
            >
              Your Journey, Our Priority
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl mb-12 text-muted-foreground"
            >
              Discover comfortable and affordable bus travel options across the city
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-4xl mx-auto"
            >
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="From"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="To"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10"
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
                          <MainCalendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      <Search className="mr-2 h-4 w-4" /> Search Buses
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
            {userLocation && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 text-muted-foreground"
              >
                Your current location: {userLocation}
              </motion.p>
            )}
          </div>
        </section>

        <section className="py-24 bg-secondary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center text-primary">Features for a Seamless Journey</h2>
            <div className="grid gap-12 md:grid-cols-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Wifi className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Free Wi-Fi</h3>
                <p className="text-muted-foreground">Stay connected throughout your journey with our complimentary high-speed Wi-Fi service.</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Coffee className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Onboard Refreshments</h3>
                <p className="text-muted-foreground">Enjoy a variety of snacks and beverages available for purchase during your trip.</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Real-time Tracking</h3>
                <p className="text-muted-foreground">Track your bus in real-time and receive updates on estimated arrival times.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {busResults.length > 0 && (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-16 text-center text-primary">Available Buses</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {busResults.map((bus) => (
                    <motion.div
                      key={bus.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Bus className="mr-2 h-5 w-5 text-primary" />
                            {bus.type} Bus
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center mb-2">
                            <CreditCard className="mr-2 h-4 w-4 text-primary" />
                            <span>Price: {bus.price}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            <span>Capacity: {bus.capacity} seats</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span>Departure: {bus.departureTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold mb-6 font-serif">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 font-serif">Contact Us</h3>
              <p className="text-muted-foreground mb-2">Email: info@swiftcommute.com</p>
              <p className="text-muted-foreground">Phone: +1 (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 font-serif">Follow Us</h3>
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