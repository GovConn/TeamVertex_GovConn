import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Clock, Calendar as CalendarIcon, Plus, Save, X } from "lucide-react";
import { createTimeSlot, updateTimeSlot } from "@/api/manage";
import { getGovServices } from "@/api/gov";
import { TimeSlot } from "@/api/interfaces";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimePicker } from '@/components/TimePicker';

type Props = {
    categoryId: number;
    editSlot?: TimeSlot | null;
    onClose?: () => void;
}

interface TimeSlotForm {
  booking_date: Date | undefined;
  start_time: string;
  end_time: string;
  max_capacity: number;
  reserved_count: number;
  recurrent_count: number;
  status: string;
  service_id: number | null;
}

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

const ConfigTimeSlots = (props: Props) => {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TimeSlotForm>({
    booking_date: undefined,
    start_time: "",
    end_time: "",
    max_capacity: 10,
    reserved_count: 0,
    recurrent_count: 1,
    status: "available",
    service_id: null
  });

  // Initialize form with edit data if provided
  useEffect(() => {
    if (props.editSlot) {
      setFormData({
        booking_date: new Date(props.editSlot.booking_date),
        start_time: props.editSlot.start_time.substring(0, 5), // Convert HH:MM:SS to HH:MM
        end_time: props.editSlot.end_time.substring(0, 5),
        max_capacity: props.editSlot.max_capacity,
        reserved_count: props.editSlot.reserved_count,
        recurrent_count: props.editSlot.recurrent_count,
        status: props.editSlot.status,
        service_id: null // Will be set when services are loaded
      });
    }
  }, [props.editSlot]);

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const response = await getGovServices(props.categoryId);
        setServices(response.data);
        
        // If editing, try to find the service_id from the slot's reservation_id
        if (props.editSlot) {
          const matchingService = response.data.find((service: Service) => 
            service.service_id === props.editSlot!.reservation_id
          );
          if (matchingService) {
            setFormData(prev => ({ ...prev, service_id: matchingService.service_id }));
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch services";
        setServicesError(errorMessage);
        console.error("Error fetching services:", err);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [props.categoryId, props.editSlot]);

  const handleInputChange = (field: keyof TimeSlotForm, value: string | number | Date | undefined) => {
    console.log("Input change:", field, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      booking_date: undefined,
      start_time: "",
      end_time: "",
      max_capacity: 10,
      reserved_count: 0,
      recurrent_count: 1,
      status: "available",
      service_id: null
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.booking_date || !formData.start_time || !formData.end_time || !formData.service_id) {
        setError("Please fill in all required fields including service selection");
        console.log("Validation failed: Required fields are missing");
        return;
      }

      if (formData.start_time >= formData.end_time) {
        setError("End time must be after start time");
        console.log("Validation failed: End time must be after start time");
        return;
      }

      if (formData.reserved_count > formData.max_capacity) {
        setError("Reserved count cannot exceed max capacity");
        console.log("Validation failed: Reserved count cannot exceed max capacity");
        return;
      }

      const payload = {
        booking_date: format(formData.booking_date, "yyyy-MM-dd"),
        end_time: `${formData.end_time}:00`,
        max_capacity: Number(formData.max_capacity),
        recurrent_count: Number(formData.recurrent_count),
        reservation_id: Number(formData.service_id),
        reserved_count: Number(formData.reserved_count),
        start_time: `${formData.start_time}:00`,
        status: formData.status
      };

      if (props.editSlot) {
        // Update existing slot - only send required fields for update API
        const updatePayload = {
            booking_date: format(formData.booking_date, "yyyy-MM-dd"),
            end_time: `${formData.end_time}:00`,
            max_capacity: Number(formData.max_capacity),
            reserved_count: Number(formData.reserved_count),
            start_time: `${formData.start_time}:00`,
            status: formData.status
        };
        
        await updateTimeSlot(props.editSlot.slot_id, updatePayload);
        setSuccess("Time slot updated successfully!");
      } else {
        
        await createTimeSlot(payload);
        setSuccess("Time slot created successfully!");
      }
      
      resetForm();
      setIsCreating(false);
      
      // Close the form if onClose is provided
      if (props.onClose) {
        setTimeout(() => {
          props.onClose!();
        }, 1500); // Give time to show success message
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save time slot";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.booking_date && 
                     formData.start_time.trim() !== "" && 
                     formData.end_time.trim() !== "" &&
                     formData.service_id !== null;

  
  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {props.editSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
          </CardTitle>
          {props.onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={props.onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {props.editSlot 
            ? 'Update the details of this time slot' 
            : 'Create and manage appointment time slots for your office'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {<div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create New Time Slot</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booking Date */}
              <div className="space-y-2">
                <Label htmlFor="booking_date">Booking Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.booking_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.booking_date ? format(formData.booking_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.booking_date}
                      onSelect={(date) => handleInputChange('booking_date', date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service_id">Service *</Label>
                {servicesLoading ? (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading services...</span>
                  </div>
                ) : servicesError ? (
                  <div className="text-sm text-red-600">{servicesError}</div>
                ) : (
                  <Select 
                    value={formData.service_id?.toString() || ""} 
                    onValueChange={(value) => handleInputChange('service_id', parseInt(value) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.service_id} value={service.service_id.toString()}>
                          {service.service_name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <TimePicker
                    value={formData.start_time}
                    onChange={(v) => handleInputChange("start_time", v)}
                    minuteStep={5}
                    use12Hour={true}
                    min="09:00"
                    max="18:00"
                />
                </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <TimePicker
                    value={formData.end_time}
                    onChange={(v) => handleInputChange("end_time", v)}
                    minuteStep={5}
                    use12Hour={true}
                    min="09:00"
                    max="18:00"
                />
              </div>

              {/* Max Capacity */}
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  min="1"
                  value={formData.max_capacity}
                  onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>

              {/* Reserved Count */}
              <div className="space-y-2">
                <Label htmlFor="reserved_count">Reserved Count</Label>
                <Input
                  id="reserved_count"
                  type="number"
                  min="0"
                  max={formData.max_capacity}
                  value={formData.reserved_count}
                  onChange={(e) => handleInputChange('reserved_count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {/* Recurrent Count - Only show when creating new slots */}
              {!props.editSlot && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recurrent_count">Recurrent Count</Label>
                  <Input
                    id="recurrent_count"
                    type="number"
                    min="0"
                    value={formData.recurrent_count}
                    onChange={(e) => handleInputChange('recurrent_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full md:w-48"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of times this slot should repeat
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                  if (props.onClose) props.onClose();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Settings className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading 
                  ? (props.editSlot ? "Updating..." : "Creating...")
                  : (props.editSlot ? "Update Time Slot" : "Create Time Slot")
                }
              </Button>
            </div>
          </div>}
      </CardContent>
    </Card>       
  );
}

export default ConfigTimeSlots;