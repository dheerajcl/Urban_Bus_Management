'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, MapPin, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar as MainCalendar } from '@/components/ui/calendar'
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
            <span className="text-xl font-bold">Urban Bus</span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <Image
            src="/app/background2.jpeg"
            alt="Urban cityscape with buses"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0"
          />
          <div className="absolute inset-0 bg-black/50 z-1"></div>
          <div className="relative z-2 text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl font-bold mb-4"
            >
              Find Your Perfect Journey
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl mb-8"
            >
              Discover comfortable and affordable bus travel options
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-4xl mx-auto"
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
          </div>
        </section>

        <section className="py-16 bg-secondary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Urban Bus?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Bus, title: "Modern Fleet", description: "Travel in comfort with our state-of-the-art buses" },
                { icon: Clock, title: "Punctual Service", description: "Reliable schedules to get you to your destination on time" },
                { icon: Shield, title: "Safe Travel", description: "Your safety is our top priority with regular maintenance and trained staff" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <feature.icon className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p>{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {busResults.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-center">Available Buses</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {busResults.map((bus) => (
                    <motion.div
                      key={bus.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="h-full">
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

        <section className="py-16 bg-secondary/10">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: Search, title: "Search", description: "Enter your route and date" },
                { icon: Bus, title: "Choose", description: "Select from available buses" },
                { icon: CreditCard, title: "Book", description: "Secure your seat with easy payment" },
                { icon: Calendar, title: "Travel", description: "Enjoy your comfortable journey" }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p>Email: info@urbanbus.com</p>
              <p>Phone: +1 (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Link href="#" className="hover:text-primary">Facebook</Link>
                <Link href="#" className="hover:text-primary">Twitter</Link>
                <Link href="#" className="hover:text-primary">Instagram</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Urban Bus Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}