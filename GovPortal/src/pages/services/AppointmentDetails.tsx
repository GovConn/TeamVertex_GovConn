import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  IdCard,
  QrCode,
} from "lucide-react";
import { ReservedUser } from "@/api/interfaces";
import { getReservedUsers } from "@/api/gov";

export function AppointmentDetails() {
  const { serviceId, timeSlot } = useParams<{
    serviceId: string;
    timeSlot: string;
  }>();
  const location = useLocation();

  const { serviceName, slotTime } =
    (location.state as {
      serviceName?: string;
      slotTime?: string;
    }) || {};

  const [reservedUsers, setReservedUsers] = useState<ReservedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!timeSlot) return;

    setLoading(true);
    getReservedUsers(timeSlot)
      .then((res) => setReservedUsers(res.data))
      .catch(() => setError("Failed to fetch appointments"))
      .finally(() => setLoading(false));
  }, [timeSlot]);

  if (!serviceId || !timeSlot) {
    return <div>Invalid appointment details</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/services/appointments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{serviceName}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {slotTime.replace(/-/g, " ").toUpperCase()} Time Slot
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="space-y-4 py-8">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-muted-foreground animate-spin" />
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Loading appointments
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fetching appointments for this time slot…
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border rounded-md bg-muted/10 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted/20" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted/20 rounded" />
                        <div className="h-3 w-28 bg-muted/20 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-muted/20 rounded" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-muted/20 rounded" />
                      <div className="h-3 w-40 bg-muted/20 rounded" />
                      <div className="h-3 w-28 bg-muted/20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted/20 rounded" />
                      <div className="h-12 w-full bg-muted/20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <div>{error}</div>
      ) : reservedUsers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Appointments
              </h3>
              <p className="text-muted-foreground">
                No appointments scheduled for this time slot.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {reservedUsers.map(({ citizen, reference_id }) => {
            // const documents = citizen?.document_links || [];
            return (
              <Card key={reference_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {citizen.first_name} {citizen.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <label className="text-muted-foreground">
                            Placed On:
                          </label>
                          {(() => {
                            const raw = citizen.created_at ?? "";
                            const normalized = raw.replace(
                              /(\.\d{3})\d+$/,
                              "$1"
                            ); // keep milliseconds
                            const d = new Date(normalized);
                            return isNaN(d.getTime())
                              ? raw
                              : d.toLocaleString();
                          })()}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{citizen.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{citizen.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{citizen.nic}</span>
                      </div>
                      <br />
                      <div className="flex items-center gap-2 text-sm">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <label className="text-foreground">Reference ID:</label>
                        <span className="text-foreground">{reference_id}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          citizen.active
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }
                      >
                        {citizen.active ? "Confirmed" : "Canceled"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="w-full">
                          <span className="text-muted-foreground font-medium">
                            Documents:
                          </span>
                          <ul className="mt-2 space-y-2">
                            {citizen.document_links?.map((doc, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/30"
                              >
                                <span className="truncate text-foreground">
                                  {doc.title}
                                </span>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                  >
                                    <FileText className="h-4 w-4" />
                                    Download
                                  </a>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
