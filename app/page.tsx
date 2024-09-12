'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

type BusResult = {
  id: number;
  type: string;
  price: string;
  capacity: number;
  departureTime: string;
};

const testimonials = [
  { id: 1, name: "John Doe", comment: "Urban Bus made my journey comfortable and affordable!", rating: 5 },
  { id: 2, name: "Jane Smith", comment: "Punctual service and modern buses. Highly recommended!", rating: 4 },
  { id: 3, name: "Mike Johnson", comment: "The best bus service I've ever used. Will definitely use again!", rating: 5 },
];

export default function LandingPage() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [busResults, setBusResults] = useState<BusResult[]>([])
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
            src="/placeholder.svg?height=1080&width=1920"
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
              className="max-w-3xl mx-auto"
            >
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="From"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="To"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full"
                      />
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

        <section className="container mx-auto px-4 py-16">
          {busResults.length > 0 && (
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
          )}
        </section>

        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Urban Bus?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full bg-primary/10">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Bus className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Modern Fleet</h3>
                    <p className="text-center">Travel in comfort with our state-of-the-art buses</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full bg-primary/10">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Clock className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Punctual Service</h3>
                    <p className="text-center">Reliable schedules to get you to your destination on time</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full bg-primary/10">
                  <CardContent className="p-6 flex flex-col items-center">
                    <CreditCard className="h-16 w-16 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Affordable Fares</h3>
                    <p className="text-center">Competitive pricing for budget-friendly travel</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="bg-primary/5 p-8 rounded-lg"
                >
                  <p className="text-lg mb-4">{testimonials[currentTestimonial].comment}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                    <div className="flex">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-primary/10 p-2 rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-primary/10 p-2 rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary/10 py-8">
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