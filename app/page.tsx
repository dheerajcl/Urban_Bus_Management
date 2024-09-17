'use client'

import React, { useState, useEffect } from 'react'
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
    const mockResults: BusResult[] = [
      { id: 1, type: 'Express', price: '₹500', capacity: 40, departureTime: '10:00 AM' },
      { id: 2, type: 'Deluxe', price: '₹750', capacity: 35, departureTime: '11:30 AM' },
      { id: 3, type: 'Sleeper', price: '₹1000', capacity: 30, departureTime: '09:00 PM' },
    ]
    setBusResults(mockResults)
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
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/background2.jpeg"
              alt="Urban cityscape with buses at night"
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
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 font sans"
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
                            <span>Price: {bus.price}</span>
                          </div>
                          <div className="flex items-center mb-2 text-foreground">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            <span>Capacity: {bus.capacity} seats</span>
                          </div>
                          <div className="flex items-center text-foreground">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span>Departure: {bus.departureTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="py-24 bg-secondary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center text-foreground">Features for a Seamless Journey</h2>
            <div className="grid gap-12 md:grid-cols-3">
              {[
                { icon: Bus, title: "Modern Fleet", description: "Travel in comfort with our state-of-the-art buses" },
                { icon: Clock, title: "Punctual Service", description: "Reliable schedules to get you to your destination on time" },
                { icon: Users, title: "Customer-Centric", description: "Exceptional service tailored to your needs" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <feature.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
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