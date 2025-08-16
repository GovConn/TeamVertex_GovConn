import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, Filter } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/redux";
import { loadServices } from "@/store/serviceSlice";
import { getGovServices, serviceSlots } from "@/api/gov";

export function Appointments() {
  const dispatch = useAppDispatch();
  const [services, setServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGovServices = async () => {
      setLoading(true);
      try {
        const userString =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const user = userString ? JSON.parse(userString) : null;
        if (!user?.id) return;

        const { data: services } = await getGovServices(user.id);
        dispatch(loadServices(services));

        const withSlots = await Promise.all(
          services.map(async (service: any) => {
            try {
              const { data: slotsData } = await serviceSlots(
                service.service_id,
                format(selectedDate, "yyyy-MM-dd")
              );

              const formattedSlots = slotsData.map((slot: any) => {
                const start = new Date(
                  `${slot.booking_date}T${slot.start_time}`
                );
                const end = new Date(`${slot.booking_date}T${slot.end_time}`);
                return {
                  slot_id: slot.slot_id,
                  reservation_id: slot.reservation_id,
                  time: `${start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${end.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`,
                  booked: slot.reserved_count,
                  total: slot.max_capacity,
                  status: slot.status,
                };
              });

              return { ...service, slots: formattedSlots };
            } catch {
              return { ...service, slots: [] };
            }
          })
        );

        setServices(withSlots);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGovServices();
  }, [dispatch, selectedDate]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Appointment Management
        </h1>
        <p className="text-muted-foreground">Manage service appointments</p>
      </div>

      {/* Filters */}
      <Card className="p-2">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <label className="text-md font-medium text-foreground">Date:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-60 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-40 bg-muted/20 rounded mb-2" />
                <div className="h-3 w-32 bg-muted/20 rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="p-3 bg-muted/10 rounded-lg flex justify-between items-center"
                  >
                    <div className="h-4 w-28 bg-muted/20 rounded" />
                    <div className="h-4 w-16 bg-muted/20 rounded" />
                  </div>
                ))}
                <div className="h-3 w-full bg-muted/20 rounded mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.service_id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {service.service_name_en}
                </CardTitle>
                <CardDescription>{service.description_en}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {service.slots.map((slot: any) => (
                    <Link
                      key={slot.slot_id}
                      to={`/services/appointments/${service.service_id}/${slot.slot_id}`}
                      state={{
                        serviceName: service.service_name_en,
                        slotTime: slot.time,
                      }}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {slot.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {slot.booked}/{slot.total}
                            </span>
                          </div>
                          <Badge
                            variant={
                              slot.booked >= slot.total
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {slot.booked < slot.total
                              ? `${slot.booked} Booked`
                              : "Full"}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="pt-2 border-t border-border space-y-2">
                  {service.slots.length > 0 &&
                    (() => {
                      const totalSlots = service.slots.reduce(
                        (acc: number, slot: any) => acc + slot.total,
                        0
                      );
                      const bookedSlots = service.slots.reduce(
                        (acc: number, slot: any) => acc + slot.booked,
                        0
                      );
                      const bookedPercent =
                        totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
                      return (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              Booked Today
                            </span>
                            <span className="font-medium text-foreground">
                              {bookedSlots}/{totalSlots}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-3 rounded-full ${
                                bookedPercent >= 100
                                  ? "bg-destructive"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${bookedPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
