import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar as CalendarIcon } from "lucide-react";
import { TimeSlot } from "@/api/interfaces";

interface TimeSlotCardProps {
  slot: TimeSlot;
  showBookingDate?: boolean;
}

export function TimeSlotCard({ slot, showBookingDate = false }: TimeSlotCardProps) {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-300/90 select-none';
      case 'full':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-300/90 select-none';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-300/90 select-none';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-300/90 select-none';
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(slot.status)}>
              {slot.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ID: {slot.slot_id}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {slot.reserved_count}/{slot.max_capacity} reserved
              </span>
            </div>
            
            {showBookingDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(slot.booking_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {slot.recurrent_count > 1 && (
              <div className="text-xs text-muted-foreground">
                Recurring: {slot.recurrent_count} times
              </div>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${(slot.reserved_count / slot.max_capacity) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
