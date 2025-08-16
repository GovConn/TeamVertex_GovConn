import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getAvailableSlots, serviceSlots } from "@/api/manage";
import { TimeSlot } from "@/api/interfaces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TimeSlotCard } from "@/components/TimeSlotCard";

interface TimeSlotsListProps {
  categoryId: number;
}

export function TimeSlotsList({ categoryId }: TimeSlotsListProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (viewAll) {
          // Fetch all available slots without date filter
          response = await getAvailableSlots(categoryId);
        } else if (selectedDate) {
          // Format date as YYYY-MM-DD for API
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          // Fetch available slots using category ID and selected date
          response = await serviceSlots(categoryId, formattedDate);
        } else {
          return;
        }
        
        setTimeSlots(response.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to fetch available slots";
        setError(errorMessage);
        console.error("Error fetching available slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [categoryId, selectedDate, viewAll]);

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped = slots.reduce((acc, slot) => {
      const date = slot.booking_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {} as Record<string, TimeSlot[]>);

    // Sort dates
    const sortedDates = Object.keys(grouped).sort();
    return sortedDates.map(date => ({
      date,
      slots: grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Time Slots
        </CardTitle>
        <CardDescription>
          Current available appointment time slots for your office
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">View Options:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewAll ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  setViewAll(false);
                  if (!selectedDate) {
                    setSelectedDate(new Date());
                  }
                }}
                className="h-8"
              >
                Filter by Date
              </Button>
              <Button
                variant={viewAll ? "default" : "outline"}
                size="sm"
                onClick={() => setViewAll(true)}
                className="h-8"
              >
                View All
              </Button>
            </div>

            {!viewAll && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className="h-8"
                  >
                    Today
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Loading...</h3>
              <p className="text-muted-foreground">Fetching available time slots</p>
            </div>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Time Slots Available</h3>
              <p className="text-muted-foreground">
                {viewAll 
                  ? "There are currently no available time slots configured"
                  : selectedDate 
                    ? `No available time slots for ${format(selectedDate, "PPP")}`
                    : "There are currently no available time slots configured"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {viewAll 
                  ? "All Available Slots" 
                  : selectedDate 
                    ? `Available Slots for ${format(selectedDate, "PPP")}`
                    : "Available Slots"
                }
              </h3>
              <Badge variant="secondary" className="text-sm">
                {timeSlots.length} slot{timeSlots.length !== 1 ? 's' : ''} available
              </Badge>
            </div>
            
            {viewAll ? (
              // Group by date when viewing all
              <div className="space-y-6">
                {groupSlotsByDate(timeSlots).map(({ date, slots }) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-lg">
                        {format(new Date(date), "EEEE, PPP")}
                      </h4>
                      <Badge variant="outline" className="ml-auto">
                        {slots.length} slot{slots.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {slots.map((slot) => (
                        <TimeSlotCard 
                          key={slot.slot_id} 
                          slot={slot} 
                          showBookingDate={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single date view
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {timeSlots.map((slot) => (
                  <TimeSlotCard 
                    key={slot.slot_id} 
                    slot={slot} 
                    showBookingDate={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
