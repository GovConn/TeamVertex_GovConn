import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Clock, Edit, Trash2, Plus, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { getAvailableSlots, deleteTimeSlot } from "@/api/manage";
import { getGovServices } from "@/api/gov";
import { TimeSlot } from "@/api/interfaces";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Service {
  service_id: number;
  gov_node_id: number;
  service_type: string;
  service_name_si: string;
  service_name_en: string;
  service_name_ta: string;
  description_si: string;
  description_en: string;
  description_ta: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  required_document_types: number[];
}

type Props = {
    categoryId: number;
    onCreateSlot?: () => void;
    onEditSlot?: (slot: TimeSlot) => void;
    onRefresh?: () => void;
}

const ConfigSlotList = (props: Props) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  // Deletion dialog state
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filterSlotsByDate = useCallback((slotsToFilter: TimeSlot[], filterDate?: Date) => {
    if (!filterDate) {
      setFilteredSlots(slotsToFilter);
      return;
    }

    const filterDateStr = format(filterDate, "yyyy-MM-dd");
    const filtered = slotsToFilter.filter(slot => {
      const slotDateStr = format(new Date(slot.booking_date), "yyyy-MM-dd");
      return slotDateStr === filterDateStr;
    });
    
    setFilteredSlots(filtered);
  }, []);

  const applyFilters = useCallback((slotsToFilter: TimeSlot[]) => {
    let filtered = [...slotsToFilter];

    // Apply service filter
    if (selectedServiceId) {
      filtered = filtered.filter(slot => slot.reservation_id === selectedServiceId);
    }

    // Apply date filter
    if (selectedDate) {
      const filterDateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter(slot => {
        const slotDateStr = format(new Date(slot.booking_date), "yyyy-MM-dd");
        return slotDateStr === filterDateStr;
      });
    }

    setFilteredSlots(filtered);
  }, [selectedDate, selectedServiceId]);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAvailableSlots(selectedServiceId || 1);
      setSlots(response.data);
      // Apply current filters after fetching
      applyFilters(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to fetch slots";
      setError(errorMessage);
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId, applyFilters]);

  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const response = await getGovServices(props.categoryId);
      setServices(response.data);
    } catch (err: unknown) {
      console.error("Error fetching services:", err);
      // Don't set error here as services are optional for viewing
    } finally {
      setServicesLoading(false);
    }
  }, [props.categoryId]);

  // Update filtered slots when filters change
  useEffect(() => {
    applyFilters(slots);
  }, [slots, selectedDate, selectedServiceId, applyFilters]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
    setShowDateFilter(false);
  };

  const clearServiceFilter = () => {
    setSelectedServiceId(null);
  };

  const clearAllFilters = () => {
    setSelectedDate(undefined);
    setSelectedServiceId(null);
    setShowDateFilter(false);
  };

  const openDeleteDialog = (slotId: number) => {
    setSelectedDeleteId(slotId);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSlot = async () => {
    if (!selectedDeleteId) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteTimeSlot(selectedDeleteId);
      // Refresh the slots list after deletion
      await fetchSlots();
      setIsDeleteDialogOpen(false);
      setSelectedDeleteId(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete slot";
      setDeleteError(errorMessage);
      console.error("Error deleting slot:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchSlots();
    fetchServices();
  }, [fetchSlots, fetchServices]);

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Convert HH:MM:SS to HH:MM
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'full':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Manage Time Slots
        </CardTitle>
        <CardDescription>
          View, create, and update appointment time slots
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {(() => {
                  const selectedService = selectedServiceId 
                    ? services.find(s => s.service_id === selectedServiceId) 
                    : null;
                  
                  if (selectedDate && selectedService) {
                    return `${filteredSlots.length} Slots for ${selectedService.service_name_en} on ${format(selectedDate, "MMM dd")}`;
                  } else if (selectedDate) {
                    return `${filteredSlots.length} Time Slots for ${format(selectedDate, "MMM dd, yyyy")}`;
                  } else if (selectedService) {
                    return `${filteredSlots.length} Slots for ${selectedService.service_name_en}`;
                  } else {
                    return `${filteredSlots.length} Time Slots`;
                  }
                })()}
              </h3>
              
              {/* Date Filter Controls */}
              <div className="flex items-center gap-2">
                <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "MMM dd") : "Filter by date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Service Filter */}
                <Select 
                  value={selectedServiceId?.toString() || ""} 
                  onValueChange={(value) => setSelectedServiceId(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className={cn(
                    "w-[200px]",
                    !selectedServiceId && "text-muted-foreground"
                  )}>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.service_id} value={service.service_id.toString()}>
                        {service.service_name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(selectedDate || selectedServiceId) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-9 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                
                <div className="text-sm text-muted-foreground">
                  {(selectedDate || selectedServiceId) && `of ${slots.length} total`}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={props.onCreateSlot}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Slot
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading slots...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchSlots} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {(selectedDate || selectedServiceId) ? "No Slots Found" : "No Time Slots"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {(selectedDate || selectedServiceId)
                    ? "No time slots match your current filters. Try adjusting your filters or create a new slot."
                    : "Create your first time slot to get started"
                  }
                </p>
                {(selectedDate || selectedServiceId) ? (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={clearAllFilters} variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button onClick={props.onCreateSlot}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Time Slot
                    </Button>
                  </div>
                ) : (
                  <Button onClick={props.onCreateSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Time Slot
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlots.map((slot) => (
                    <TableRow key={slot.slot_id}>
                      <TableCell className="font-medium">#{slot.slot_id}</TableCell>
                      <TableCell>{new Date(slot.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const service = services.find(s => s.service_id === slot.reservation_id);
                          return service ? service.service_name_en : `Service #${slot.reservation_id}`;
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => props.onEditSlot?.(slot)}
                            disabled={loading}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => openDeleteDialog(slot.slot_id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete time slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600 mb-2">{deleteError}</p>
          )}
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteSlot} className="bg-red-600 text-white" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ConfigSlotList;