import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

export type Stop = {
  id?: number;
  stop_name: string;
  stop_order: number;
};

export type ScheduleInfo = {
  is_assigned: boolean;
  bus_number: string | null;
  departure_time: string | null;
  arrival_time: string | null;
};

export type Route = {
  id: number;
  name: string;
  source: string;
  destination: string;
  operator_id: number;
  stops: Stop[];
  schedule_info: ScheduleInfo | null;
};

export default function RoutesPage() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id' | 'schedule_info'>>({
    name: '',
    source: '',
    destination: '',
    operator_id: 1,
    stops: [],
  });
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/routes');
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      const data = await response.json();
      setRoutes(data);
      toast({
        title: "Success",
        description: "Routes loaded successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch routes. Please try again later.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleAddRoute = async () => {
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoute),
      });
      if (!response.ok) {
        throw new Error('Failed to add route');
      }
      const addedRoute = await response.json();
      setRoutes([...routes, addedRoute]);
      setIsAddDialogOpen(false);
      setNewRoute({
        name: '',
        source: '',
        destination: '',
        operator_id: 1,
        stops: [],
      });
      toast({
        title: "Success",
        description: "Route added successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error adding route:', error);
      toast({
        title: "Error",
        description: "Failed to add route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const handleEditRoute = async () => {
    if (!editingRoute) return;
    try {
      const response = await fetch('/api/routes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRoute),
      });
      if (!response.ok) {
        throw new Error('Failed to update route');
      }
      const updatedRoute = await response.json();
      setRoutes(routes.map(route => route.id === updatedRoute.id ? updatedRoute : route));
      setIsEditDialogOpen(false);
      setEditingRoute(null);
      toast({
        title: "Success",
        description: "Route updated successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const handleDeleteRoute = async (id: number) => {
    try {
      const response = await fetch(`/api/routes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete route');
      }
      setRoutes(routes.filter(route => route.id !== id));
      toast({
        title: "Success",
        description: "Route deleted successfully",
        className: "bg-green-700 text-white p-2 text-sm",
        style: { minWidth: '200px' },
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
        className: "p-2 text-sm",
        style: { minWidth: '200px' },
      });
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Route Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Route
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Route</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newRoute.name}
                      onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">
                      Source
                    </Label>
                    <Input
                      id="source"
                      value={newRoute.source}
                      onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="destination" className="text-right">
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      value={newRoute.destination}
                      onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stops" className="text-right">
                      Stops
                    </Label>
                    <div className="col-span-3 space-y-2">
                      {newRoute.stops.map((stop, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={stop.stop_name}
                            onChange={(e) => {
                              const updatedStops = [...newRoute.stops];
                              updatedStops[index].stop_name = e.target.value;
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                            placeholder="Stop name"
                          />
                          <Input
                            type="number"
                            value={stop.stop_order}
                            onChange={(e) => {
                              const updatedStops = [...newRoute.stops];
                              updatedStops[index].stop_order = parseInt(e.target.value);
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                            placeholder="Order"
                            className="w-20"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedStops = newRoute.stops.filter((_, i) => i !== index);
                              setNewRoute({ ...newRoute, stops: updatedStops });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => setNewRoute({
                          ...newRoute,
                          stops: [...newRoute.stops, { stop_name: '', stop_order: newRoute.stops.length + 1 }]
                        })}
                      >
                        Add Stop
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddRoute}>Add Route</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.name}</TableCell>
                    <TableCell>{route.source}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.stops.length}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingRoute(route);
                          setIsEditDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {route.schedule_info && route.schedule_info.is_assigned ? (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium cursor-pointer">
                                Bus Assigned
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">Assigned Bus Details</h4>
                                  <p className="text-sm">Bus Number: {route.schedule_info.bus_number || 'N/A'}</p>
                                  <p className="text-sm">
                                    Departure: {route.schedule_info.departure_time 
                                      ? new Date(route.schedule_info.departure_time).toLocaleString() 
                                      : 'N/A'}
                                  </p>
                                  <p className="text-sm">
                                    Arrival: {route.schedule_info.arrival_time 
                                      ? new Date(route.schedule_info.arrival_time).toLocaleString() 
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/assign-bus/${route.id}`}>
                              <Bus className="h-4 w-4 mr-2" />
                              Assign Bus
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingRoute.name}
                  onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-source" className="text-right">
                  Source
                </Label>
                <Input
                  id="edit-source"
                  value={editingRoute.source}
                  onChange={(e) => setEditingRoute({ ...editingRoute, source: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-destination" className="text-right">
                  Destination
                </Label>
                <Input
                  id="edit-destination"
                  value={editingRoute.destination}
                  onChange={(e) => setEditingRoute({ ...editingRoute, destination: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stops" className="text-right">
                  Stops
                </Label>
                <div className="col-span-3 space-y-2">
                  {editingRoute.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={stop.stop_name}
                        onChange={(e) => {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_name = e.target.value;
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                        placeholder="Stop name"
                      />
                      <Input
                        type="number"
                        value={stop.stop_order}
                        onChange={(e) => {
                          const updatedStops = [...editingRoute.stops];
                          updatedStops[index].stop_order = parseInt(e.target.value);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                        placeholder="Order"
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedStops = editingRoute.stops.filter((_, i) => i !== index);
                          setEditingRoute({ ...editingRoute, stops: updatedStops });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => setEditingRoute({
                      ...editingRoute,
                      stops: [...editingRoute.stops, { stop_name: '', stop_order: editingRoute.stops.length + 1 }]
                    })}
                  >
                    Add Stop
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditRoute}>Update Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}