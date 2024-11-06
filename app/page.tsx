'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, MapPin, Calendar as CalendarIcon, ChevronRight, Menu, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import BookingModal from '@/components/BookingModal'

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
  const [date, setDate] = useState<Date>(new Date())
  const [busResults, setBusResults] = useState<BusResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusResult | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const blobRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (blobRef.current && heroSectionRef.current) {
        const heroRect = heroSectionRef.current.getBoundingClientRect()
        const { clientX, clientY } = e
        
        // Only update blob position if mouse is within hero section
        if (clientY <= heroRect.bottom) {
          blobRef.current.style.transform = `translate3d(calc(${clientX}px - 50%), calc(${clientY}px - 50%), 0)`
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const fetchSuggestions = async (term: string, setSuggestions: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (term.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/stops?term=${term}`)
      if (!response.ok) throw new Error('Failed to fetch suggestions')
      const data = await response.json()
      setSuggestions(data.map((item: { stop_name: string }) => item.stop_name))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!source || !destination || !date) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchAttempted(true)

    const searchParams = new URLSearchParams({
      source,
      destination,
      date: format(date, 'yyyy-MM-dd')
    })

    try {
      const response = await fetch(`/api/search-buses?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch bus results')
      const data = await response.json()
      setBusResults(data)
    } catch (error) {
      console.error('Search buses error:', error)
      setError('An error occurred while searching for buses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenBookingModal = (bus: BusResult) => {
    setSelectedBus(bus)
    setIsBookingModalOpen(true)
  }

  const handleCloseBookingModal = () => {
    setSelectedBus(null)
    setIsBookingModalOpen(false)
  }

  const handleBook = async (busId: number, seats: number, email: string, name: string) => {
    try {
      const response = await fetch(`/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId, seats, email, name })
      })
      if (!response.ok) throw new Error('Failed to book seats')
      const data = await response.json()
      console.log('Booking Response:', data)
      setBusResults((prevResults) =>
        prevResults.map((bus) =>
          bus.id === busId ? { ...bus, available_seats: bus.available_seats - seats } : bus
        )
      )
      handleCloseBookingModal()
    } catch (error) {
      console.error('Booking error:', error)
      alert('An error occurred while booking. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <style jsx global>{`
        .blob {
          width: 650px;
          height: 650px;
          border-radius: 100%;
          background-image: linear-gradient(#1100ff 10%, #ff00f2);
          filter: blur(250px);
          transition: all 450ms ease-out;
          position: absolute;
          pointer-events: none;
          left: 0;
          top: 0;
          transform: translate(calc(-50% + 15px), -50%);
          z-index: 0;
        }
      `}</style>

      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollY > 50 ? "bg-zinc-900/40 backdrop-blur-md" : "bg-transparent"
      )}>
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center max-w-6xl">
        <Link href="/" className="flex items-center space-x-2">
          <Bus className="h-5 w-6" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-semibold italic bg-clip-text relative">
                Swift
                <svg 
                  className="absolute -bottom-1 left-0"
                  width="100%"
                  height="6"
                  viewBox="0 0 100 6"
                >
                  <line 
                    x1="0" 
                    y1="3" 
                    x2="80" 
                    y2="3" 
                    stroke="#22c55e" 
                    strokeWidth="3"
                  />
                  <polygon 
                    points="80,0 95,3 80,6"
                    fill="#22c55e"
                  />
                </svg>
              </span>
              <span className="text-2xl font-semibold text-white">
                Commute
              </span>
            </div>
          </div>
        </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#features" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">Features</Link>
            <Link href="#about" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">About</Link>
            <Link href="#contact" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">Contact</Link>
            <Link href="/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
          <Button variant="ghost" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </nav>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-black/90 backdrop-blur-sm z-50"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
                <Link href="#features" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">Features</Link>
                <Link href="#about" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">About</Link>
                <Link href="#contact" className="text-zinc-400 font-medium transition-colors duration-300 hover:text-white">Contact</Link>
                <Link href="/login">
                  <Button>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section ref={heroSectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20">
          <div ref={blobRef} className="blob"></div>
          <div className="relative z-10 text-center px-4 w-full max-w-6xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-16 bg-clip-text"
            >
              Revolutionizing urban travel with intelligent bus routing
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl mb-12 text-zinc-200 relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#22c55e]"
            >
              Search for Available Buses
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-4xl mx-auto"
            >
              <Card className="bg-zinc-950/50 backdrop-blur-xl border border-white/10">
                <CardContent className="p-7">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80" />
                      <Input
                        type="text"
                        placeholder="From"
                        value={source}
                        onChange={(e) => {
                          setSource(e.target.value)
                          fetchSuggestions(e.target.value, setSourceSuggestions)
                        }}
                        className="pl-10 bg-zinc-900/50 border-white/20 text-white placeholder-white/60 focus-visible:ring-white/20 focus-visible:ring-offset-zinc-900 h-10"
                      />
                      {sourceSuggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-zjsx-c6749d47b0d8825c flex flex-col md:flex-row gap-5inc-900/90 border border-zinc-800 mt-1 rounded-md shadow-xl">
                          {sourceSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                setSource(suggestion)
                                setSourceSuggestions([])
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-zinc-800/50 text-zinc-300"
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80" />
                      <Input
                        type="text"
                        placeholder="To"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value)
                          fetchSuggestions(e.target.value, setDestinationSuggestions)
                        }}
                        className="pl-10 bg-zinc-900/50 border-white/20 text-white placeholder-white/60 focus-visible:ring-white/20 focus-visible:ring-offset-zinc-900 h-10"
                      />
                      {destinationSuggestions.length > 0 && (
                        <ul className="absolute z-20 w-full bg-zinc-900/90 border border-zinc-800 mt-1 rounded-md shadow-xl">
                          {destinationSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                setDestination(suggestion)
                                setDestinationSuggestions([])
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-zinc-800/50 text-zinc-300"
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !date && "text-zinc-500",
                              "bg-zinc-900/50 border-white/20 text-white hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-900/90 border-white/20">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(day) => day && setDate(day)}
                            initialFocus
                            className="bg-zinc-900 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-white hover:bg-white/90 text-black h-10 transition-colors" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    <p className="mt-4 text-red-400 text-center text-sm">{error}</p>
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
              className="py-24 bg-zinc-900"
            >
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-16 text-center text-zinc-50">Available Buses</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {busResults.map((bus) => (
                    <motion.div
                      key={bus.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="bg-zinc-800 border-zinc-700 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4 text-zinc-50 flex items-center">
                            <Bus className="mr-2 h-5 w-5 text-blue-500" />
                            {bus.type} Bus
                          </h3>
                          <div className="space-y-2 text-zinc-400">
                            <p className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
                              Price: ₹{bus.price}
                            </p>
                            <p className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-blue-500" />
                              Available Seats: {bus.available_seats}/{bus.capacity}
                            </p>
                            <p className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-blue-500" />
                              Departure: {new Date(bus.departure_time).toLocaleTimeString()}
                            </p>
                            <p className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-blue-500" />
                              Arrival: {new Date(bus.arrival_time).toLocaleTimeString()}
                            </p>
                            <p className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                              {bus.route_name}
                            </p>
                          </div>
                          <Button 
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-zinc-50" 
                            onClick={() => handleOpenBookingModal(bus)}
                          >
                            Book Now
                          </Button>
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
          <section className="py-24 bg-zinc-900">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4 text-zinc-50">No buses found</h2>
              <p className="text-zinc-400">Try adjusting your search criteria or selecting a different date.</p>
            </div>
          </section>
        )}

        <section id="features" className="py-24 bg-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center text-zinc-50">Why Choose Swift Commute?</h2>
            <div className="grid gap-12 md:grid-cols-3">
              <FeatureCard
                icon={<Clock className="h-12 w-12 text-blue-500" />}
                title="Real-time Updates"
                description="Get live updates on bus locations and estimated arrival times."
              />
              <FeatureCard
                icon={<MapPin className="h-12 w-12 text-blue-500" />}
                title="Smart Routing"
                description="Our AI optimizes routes for the fastest and most efficient travel."
              />
              <FeatureCard
                icon={<Bus className="h-12 w-12 text-blue-500" />}
                title="Eco-friendly"
                description="Reduce your carbon footprint by choosing public transportation."
              />
            </div>
          </div>
        </section>

        <section id="about" className="py-24 bg-zinc-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 text-zinc-50">About Swift Commute</h2>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Swift Commute is revolutionizing urban travel with our intelligent bus routing system. 
                We&apos;are committed to making public transportation more efficient, accessible, and 
                environmentally friendly for everyone.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-zinc-50 text-lg px-8 py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105">
                Learn More <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-zinc-900 py-16 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-zinc-50">Swift Commute</h3>
              <p className="text-zinc-400 leading-relaxed">Revolutionizing urban travel with intelligent bus routing.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-zinc-50">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">FAQs</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-zinc-50">Connect</h3>
              <div className="flex space-x-6">
                <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-zinc-400 hover:text-blue-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-400">
            <p>&copy; 2024 Swift Commute. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {isBookingModalOpen && selectedBus && (
        <BookingModal
          busId={selectedBus.id}
          availableSeats={selectedBus.available_seats}
          onClose={handleCloseBookingModal}
          onBook={handleBook}
        />
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center p-6 bg-zinc-800 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="inline-block p-4 bg-blue-900 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-zinc-50">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}