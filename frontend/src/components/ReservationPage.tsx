"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';

interface TimeSlot {
  id: string;
  time: string;
  available: number;
  isBooked?: boolean;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
}

// Create a loading component
function ReservationPageLoading() {
  return (
    <div className="min-h-screen bg-bgWhite flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-textGrey">Loading application form...</p>
      </div>
    </div>
  );
}


// Wrap your main component
export default function ReservationPageWrapper() {
  return (
    <Suspense fallback={<ReservationPageLoading />}>
      <ReservationPage />
    </Suspense>
  );
}

function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Time slots for the selected date
  const timeSlots: TimeSlot[] = [
    { id: "slot1", time: "8.30 AM - 9.00 AM", available: 11 },
    { id: "slot2", time: "8.30 AM - 9.00 AM", available: 0 },
    { id: "slot3", time: "8.30 AM - 9.00 AM", available: 0 },
    { id: "slot4", time: "8.30 AM - 9.00 AM", available: 0, isBooked: true }
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate calendar days
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      days.push({
        date: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === currentDay.toDateString(),
        isAvailable: currentDay >= today && currentDay.getMonth() === month
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isAvailable && day.isCurrentMonth) {
      const newSelectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day.date
      );
      setSelectedDate(newSelectedDate);
      setSelectedTimeSlot(null); // Reset time slot when date changes
    }
  };

  const handleNext = () => {
    if (selectedDate && selectedTimeSlot) {
      // Navigate to confirmation page or next step
      router.push(`/appointments/confirmation?service=${service}&date=${selectedDate.toISOString()}&slot=${selectedTimeSlot}`);
    }
  };

  const isFormValid = selectedDate && selectedTimeSlot;

  return (
    <div className="min-h-screen bg-bgWhite">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bgWhite border-b border-strokeGrey px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link 
            href="/appointments/booking" 
            className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-textBlack mb-2 sm:text-3xl">
              Reservation
            </h1>
          </div>

          {/* Date Selection Section */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-textBlack">
              Reserve the date and time
            </h2>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-strokeGrey/30"></div>
                <span className="text-textGrey">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-strokeError"></div>
                <span className="text-textGrey">Filled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-mainYellow"></div>
                <span className="text-textGrey">Your Selection</span>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-bgDisabled/30 rounded-3xl p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-bgWhite rounded-full transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-textGrey" />
                </button>
                
                <div className="flex items-center gap-4">
                  <select
                    value={months[currentDate.getMonth()]}
                    onChange={(e) => {
                      const monthIndex = months.indexOf(e.target.value);
                      setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
                    }}
                    className="bg-transparent text-textBlack font-medium focus:outline-none"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={currentDate.getFullYear()}
                    onChange={(e) => {
                      setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth()));
                    }}
                    className="bg-transparent text-textBlack font-medium focus:outline-none"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-bgWhite rounded-full transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-textGrey" />
                </button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-textGrey py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!day.isAvailable}
                    className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all duration-200 ${
                      day.isSelected
                        ? "bg-textBlack text-textWhite font-bold"
                        : day.isToday
                        ? "bg-mainYellow text-textBlack font-bold"
                        : day.isAvailable && day.isCurrentMonth
                        ? "hover:bg-strokeGrey/20 text-textBlack"
                        : day.isCurrentMonth
                        ? "text-textGrey cursor-not-allowed"
                        : "text-textGrey/50 cursor-not-allowed"
                    }`}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Time Slot Selection */}
          {selectedDate && (
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-textBlack">
                Available Time Slots for {selectedDate.toLocaleDateString()}
              </h3>
              
              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => !slot.isBooked && slot.available > 0 && setSelectedTimeSlot(slot.id)}
                    disabled={slot.isBooked || slot.available === 0}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 ${
                      selectedTimeSlot === slot.id
                        ? "bg-mainYellow text-textBlack shadow-md"
                        : slot.isBooked
                        ? "bg-strokeError/20 text-strokeError cursor-not-allowed"
                        : slot.available === 0
                        ? "bg-strokeGrey/20 text-textGrey cursor-not-allowed"
                        : "bg-strokeGrey/10 text-textBlack hover:bg-strokeGrey/20"
                    }`}
                  >
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-sm font-bold">
                      {slot.isBooked ? "XXX" : slot.available}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Next Button */}
          <div className="pt-6">
            <button
              onClick={handleNext}
              disabled={!isFormValid}
              className={`w-full py-4 px-6 font-semibold rounded-2xl text-base sm:text-lg transition-all duration-200 ${
                isFormValid
                  ? "bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover shadow-md hover:shadow-lg"
                  : "bg-bgDisabled text-textGrey cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
