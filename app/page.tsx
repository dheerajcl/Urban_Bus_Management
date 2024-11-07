'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Bus, Clock, Users, CreditCard, MapPin, Calendar as CalendarIcon, Menu, LogIn, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Twitter, Facebook, Instagram } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, AnimatePresence } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import BookingModal from '@/components/BookingModal'
// import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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

type Feature = {
  icon: React.ReactNode
  title: string
  description: string
}

type SocialLink = {
  href: string
  icon: React.ReactNode
  label: string
}

export default function LandingPage() {
  const { toast } = useToast()
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [busResults, setBusResults] = useState<BusResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusResult | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const blobRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const resultsRef = useRef<HTMLElement>(null)

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
        
        if (clientY <= heroRect.bottom) {
          blobRef.current.style.transform = `translate3d(calc(${clientX}px - 50%), calc(${clientY}px - 50%), 0)`
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    // Check if user is logged in (e.g., by checking localStorage or a cookie)
    const userToken = localStorage.getItem('userToken')
    setIsLoggedIn(!!userToken)
  }, [])

  const handleLogout = () => {
    // Clear user token and update state
    localStorage.removeItem('userToken')
    setIsLoggedIn(false)
  }

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
      if (data.length > 0 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
      if (!response.ok) {
        throw new Error('Failed to book seats')
      }
      const data = await response.json()
      console.log('Booking Response:', data)
      setBusResults((prevResults) =>
        prevResults.map((bus) =>
          bus.id === busId ? { ...bus, available_seats: bus.available_seats - seats } : bus
        )
      )
      handleCloseBookingModal()
      // Show a success message to the user
      toast({
        title: 'Booking Successful',
        description: `Total price: ₹${data.totalPrice.toFixed(2)}`,
        className: "bg-green-700 text-white p-2 text-sm",
      })
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: 'Booking Failed',
        description: 'An error occurred while booking. Please try again.',
        variant: "destructive",
      })
    }
  }

  const features: Feature[] = [
    {
      icon: <Bus className="h-6 w-6 text-green-500" />,
      title: "Real-time Tracking",
      description: "Track your bus location in real-time with our advanced GPS system"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-green-500" />,
      title: "Secure Payments",
      description: "Safe and secure payment processing for your peace of mind"
    },
    {
      icon: <Clock className="h-6 w-6 text-green-500" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your travel needs"
    }
  ]
  
  const socialLinks: SocialLink[] = [
    {
      href: "https://twitter.com/swiftcommute",
      icon: <Twitter className="h-5 w-5" />,
      label: "Twitter"
    },
    {
      href: "https://facebook.com/swiftcommute",
      icon: <Facebook className="h-5 w-5" />,
      label: "Facebook"
    },
    {
      href: "https://instagram.com/swiftcommute",
      icon: <Instagram className="h-5 w-5" />,
      label: "Instagram"
    }
  ]

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
            {isLoggedIn ? (
              <>
                <Link href="/user/dashboard">
                  <Button>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/user/login">
                  <Button>
                    <LogIn className="mr-2 h-4 w-4" />
                    User Login
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button>
                    <LogIn className="mr-2 h-4 w-4" />
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
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
                {isLoggedIn ? (
                  <>
                    <Link href="/user/dashboard">
                      <Button className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/user/login">
                      <Button className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        User Login
                      </Button>
                    </Link>
                    <Link href="/admin/login">
                      <Button className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Admin Login
                      </Button>
                    </Link>
                  </>
                )}
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
                        <ul className="absolute z-20 w-full bg-zinc-900/90 border border-zinc-800 mt-1 rounded-md shadow-xl">
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

        {/* Results Section */}
        <AnimatePresence>
          {busResults.length > 0 && (
            <motion.section
              ref={resultsRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="py-24 bg-background/50 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-16 text-center text-foreground">Available Buses</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {busResults.map((bus) => (
                    <motion.div
                      key={bus.id}
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="bg-card border-border hover:border-border/80">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-6 text-card-foreground flex items-center">
                            <Bus className="mr-2 h-5 w-5 text-green-500" />
                            {bus.type} Bus
                          </h3>
                          <div className="space-y-4 text-muted-foreground">
                            <p className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                              ₹{bus.price}
                            </p>
                            <p className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-green-500" />
                              {bus.available_seats}/{bus.capacity} seats
                            </p>
                            <p className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-green-500" />
                              {new Date(bus.departure_time).toLocaleTimeString()}
                            </p>
                            <p className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-green-500" />
                              {new Date(bus.arrival_time).toLocaleTimeString()}
                            </p>
                            <p className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-green-500" />
                              {bus.route_name}
                            </p>
                          </div>
                          <Button 
                            className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100" 
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
        
        {/* Features Section */}
        <section id="features" className="py-24 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-16 text-center text-foreground">Why Choose Swift Commute?</h2>
            <div className="grid gap-12 md:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>
            
        {/* About Section with FAQs */}
        <section id="about" className="py-24 bg-muted/50 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center text-foreground">About Swift Commute</h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed text-center">
                Swift Commute is revolutionizing urban travel with our intelligent bus routing system. 
                We&apos;re committed to making public transportation more efficient, accessible, and 
                environmentally friendly for everyone.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How does booking work?</AccordionTrigger>
                  <AccordionContent>
                    Search for your route, select your preferred bus, and book instantly with our secure payment system.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What if I need to cancel?</AccordionTrigger>
                  <AccordionContent>
                    Cancellations are free up to 24 hours before departure. A small fee applies for later cancellations.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Are the buses trackable?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all our buses are equipped with GPS tracking. Track your bus in real-time through our app.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>
            
      {/* Footer */}
      <footer className="bg-background py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Swift Commute</h3>
              <p className="text-muted-foreground">Revolutionizing urban travel with intelligent bus routing.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="#" className="text-muted-foreground hover:text-green-500 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-green-500 transition-colors">FAQs</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-green-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground">Connect</h3>
              <div className="flex space-x-6">
                {socialLinks.map((link, index) => (
                  <Link 
                    key={index}
                    href={link.href} 
                    className="text-muted-foreground hover:text-green-500 transition-colors"
                  >
                    {link.icon}
                    <span className="sr-only">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
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

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="text-center p-8 bg-card border border-border rounded-xl transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]">
      <div className="inline-block p-4 bg-green-500/10 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}