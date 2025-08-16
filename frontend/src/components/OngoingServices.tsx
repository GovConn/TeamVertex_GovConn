"use client";
import { ChevronRight, RefreshCcw, Clock, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHistory } from "@/contexts/HistoryContext";
import { useEffect, useState } from "react";
import { useHistoryTranslations } from "@/hooks/useTranslations";


export type ServiceItem = {
  id: string;
  label: string;
  status: 'upcoming' | 'completed' | 'available';
  days_to_booking?: number;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  slot_id?: number;
};

interface OngoingServicesProps {
  items?: ServiceItem[];
  className?: string;
  onItemClick?: (item: ServiceItem) => void;
  showHistory?: boolean;
}

const OngoingServices = ({ 
  items: externalItems, 
  className, 
  onItemClick,
  showHistory = false 
}: OngoingServicesProps) => {
  const { appointments, isLoading, refreshHistory } = useHistory();
  const [displayItems, setDisplayItems] = useState<ServiceItem[]>([]);
  const t = useHistoryTranslations(); // Use history-specific translations

  // Transform appointments to service items
  useEffect(() => {
    if (showHistory && appointments.length > 0) {
      const transformedItems: ServiceItem[] = appointments
        .filter((appointment) => 
          (appointment.status === 'upcoming' || appointment.status === 'completed' || appointment.status === 'available')
        )
        .slice(0, 3) // Show only first 3 items
        .map((appointment) => {
          const formatLabel = () => {
            const date = new Date(appointment.booking_date);
            const formattedDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            
            if (appointment.status === 'upcoming') {
              let daysText = '';
              if (appointment.days_to_booking === 1) {
                daysText = t('tomorrow');
              } else if (appointment.days_to_booking === 0) {
                daysText = t('today');
              } else {
                daysText = t('daysCount').replace('{{count}}', appointment.days_to_booking?.toString() || '0');
              }
              return `${t('appointment')} - ${formattedDate} (${daysText})`;
            } else if (appointment.status === 'completed') {
              return `${t('completed')} - ${formattedDate}`;
            } else {
              return `${t('service')} - ${formattedDate}`;
            }
          };

          // Explicitly cast status to ServiceItem['status'] to satisfy type
          return {
            id: appointment.slot_id.toString(),
            label: formatLabel(),
            status: appointment.status as ServiceItem['status'],
            days_to_booking: appointment.days_to_booking,
            booking_date: appointment.booking_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            slot_id: appointment.slot_id,
          };
        });
      
      setDisplayItems(transformedItems);
    } else if (externalItems) {
      setDisplayItems(externalItems);
    }
  }, [appointments, externalItems, showHistory]);

  const handleRefresh = () => {
    if (showHistory) {
      refreshHistory();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      default:
        return 'bg-bgWhite';
    }
  };

  return (
    <section
      aria-label={showHistory ? t('recentAppointments') : t('ongoingServices')}
      className={cn("rounded-2xl bg-mainYellow text-brand-foreground p-5 shadow-lg", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {showHistory ? t('recentAppointments') : t('ongoingServices')}
        </h2>
        <button
          aria-label={showHistory ? t('refreshAppointments') : t('refreshServices')}
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-full border border-brand-foreground/30 p-2 hover:bg-brand-foreground/10 transition disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-foreground border-t-transparent"></div>
          <span className="ml-2 text-sm">{t('loading')}</span>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={`group flex w-full items-center justify-between rounded-full px-4 py-3 text-left shadow-md transition hover:-translate-y-0.5 active:scale-[0.99] ${getStatusColor(item.status)}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {showHistory && getStatusIcon(item.status)}
                      <span className="font-medium truncate text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="grid h-8 w-8 place-items-center rounded-full border text-muted-foreground group-hover:text-foreground transition flex-shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="text-center py-6">
                <div className="text-gray-500">
                  {showHistory ? t('noAppointmentsFound') : t('noOngoingServices')}
                </div>
              </li>
            )}
          </ul>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => onItemClick?.({ id: 'view-all', label: t('viewAll'), status: 'available' })}
              className="underline font-medium hover:no-underline transition-all"
            >
              {t('viewAll')}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default OngoingServices;
