"use client";
import React, { useState } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { ArrowLeft, Star, CheckCircle, Calendar, MapPin, Clock, Users, Send, CalendarDays, Filter, ArrowUpDown } from 'lucide-react';

interface HistoryPageProps {
  onBack?: () => void;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}> = ({ rating, onRatingChange, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`w-5 h-5 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange?.(star)}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Enhanced Days to Booking Badge
const DaysToBookingBadge: React.FC<{ daysToBooking: number; status: string }> = ({ daysToBooking, status }) => {
  if (status === 'completed' || daysToBooking === 0) {
    return null;
  }

  const getBadgeColor = () => {
    if (daysToBooking === 1) return 'bg-orange-100 text-orange-800';
    if (daysToBooking <= 3) return 'bg-yellow-100 text-yellow-800';
    if (daysToBooking <= 7) return 'bg-yellow-100 text-yellow-800'; // Changed from blue to yellow
    return 'bg-green-100 text-green-800';
  };

  const getBadgeText = () => {
    if (daysToBooking === 1) return 'Tomorrow';
    if (daysToBooking <= 7) return `${daysToBooking} days`;
    return `${daysToBooking} days`;
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
      <CalendarDays className="w-3 h-3" />
      {getBadgeText()}
    </span>
  );
};

const AppointmentCard: React.FC<{
  appointment: any;
  onRate: (slotId: number, rating: number, comment?: string) => void;
}> = ({ appointment, onRate }) => {
  const [showRating, setShowRating] = useState(false);
  const [comment, setComment] = useState(appointment.comment || '');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompleted = appointment.status === 'completed';

  // Format booking date
  const formatBookingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRate(appointment.slot_id, selectedRating, comment);
      setShowRating(false);
      setComment('');
      setSelectedRating(0);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowRating(false);
    setComment(appointment.comment || '');
    setSelectedRating(0);
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-6 mb-4 hover:shadow-md transition-all duration-200 ${
      isCompleted 
        ? 'border-green-100 bg-gradient-to-r from-green-50 to-white' 
        : appointment.status === 'upcoming' 
        ? 'border-yellow-100 bg-gradient-to-r from-yellow-50 to-white' // Changed from blue to yellow
        : 'border-gray-100'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          {/* Service Name and Status Icon */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold text-lg text-gray-900">
              {appointment.service_name}
            </h3>
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>

          {/* Enhanced Booking Date Display */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm">
                {formatBookingDate(appointment.booking_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {appointment.start_time} - {appointment.end_time}
              </span>
            </div>
          </div>
          
          {/* Capacity Info */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {appointment.reserved_count}/{appointment.max_capacity} reserved
            </span>
          </div>

          {/* IDs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-gray-500">Slot ID</span>
              <div className="font-medium text-sm text-gray-900">{appointment.slot_id}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Reservation ID</span>
              <div className="font-medium text-sm text-gray-900">{appointment.reservation_id}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{appointment.location}</span>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              appointment.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : appointment.status === 'upcoming'
                ? 'bg-[#FFB900] text-black' // Changed from blue to custom yellow
                : appointment.status === 'available'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              appointment.slot_status === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              Slot: {appointment.slot_status}
            </span>

            {/* Days to booking badge */}
            <DaysToBookingBadge 
              daysToBooking={appointment.days_to_booking} 
              status={appointment.status}
            />
          </div>
        </div>

        {/* Enhanced Rating Section */}
        {isCompleted && (
          <div className="flex flex-col items-end gap-3 ml-4">
            {appointment.rating ? (
              <div className="flex flex-col items-end min-w-[200px]">
                <span className="text-xs text-gray-500 mb-2">Your Rating</span>
                <StarRating rating={appointment.rating} readonly />
                {appointment.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-[250px]">
                    <span className="text-xs text-gray-500 mb-1 block">Your Comment:</span>
                    <p className="text-sm text-gray-700 italic">"{appointment.comment}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-end">
                {showRating ? (
                  <div className="bg-white rounded-lg p-4 border-2 border-[#FFB900] shadow-lg min-w-[320px]"> {/* Changed from blue to custom yellow */}
                    <div className="text-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Rate this service</span>
                    </div>
                    
                    {/* Star Rating Selection */}
                    <div className="flex justify-center mb-4">
                      <StarRating
                        rating={selectedRating}
                        onRatingChange={handleRatingSelect}
                      />
                    </div>
                    
                    {/* Selected Rating Display */}
                    {selectedRating > 0 && (
                      <div className="text-center mb-3">
                        <span className="text-sm text-gray-600">
                          You selected: <span className="font-medium text-[#E28E00]">{selectedRating} star{selectedRating > 1 ? 's' : ''}</span> {/* Changed from blue to custom yellow hover */}
                        </span>
                      </div>
                    )}

                    {/* Comment Textarea */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1">
                        Share your experience (optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell others about your experience..."
                        className="w-full text-sm p-3 border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-[#FFB900] focus:border-transparent" // Changed focus color to custom yellow
                        rows={3}
                        maxLength={200}
                      />
                    </div>
                    
                    {/* Character Counter */}
                    <div className="text-right mb-3">
                      <span className={`text-xs ${comment.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
                        {comment.length}/200
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex-1 text-sm bg-gray-100 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitRating}
                        disabled={selectedRating === 0 || isSubmitting}
                        className={`flex-1 text-sm px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                          selectedRating === 0
                            ? 'bg-[#F8D984] text-gray-500 cursor-not-allowed' // Changed disabled state to custom yellow disabled
                            : 'bg-[#FFB900] text-black hover:bg-[#E28E00] shadow-sm' // Changed from blue to custom yellow scheme
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent"></div> {/* Changed spinner color to black */}
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            Submit Rating
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRating(true)}
                    className="bg-gradient-to-r from-[#FFB900] to-[#E28E00] text-black px-6 py-2 rounded-full text-sm font-medium hover:from-[#E28E00] hover:to-[#BB6402] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105" // Changed from blue gradient to custom yellow gradient
                  >
                    Rate Service
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State (when submitting from outside the modal) */}
      {isSubmitting && !showRating && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[#E28E00]"> {/* Changed from blue to custom yellow */}
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E28E00] border-t-transparent"></div> {/* Changed from blue to custom yellow */}
            <span className="text-sm">Submitting rating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const { appointments, isLoading, error, rateAppointment, refreshHistory } = useHistory();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  // Categorize appointments
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const otherAppointments = appointments.filter(apt => apt.status !== 'upcoming' && apt.status !== 'completed');

  // --- Added: simple range filter + sort for Upcoming ---
  const [range, setRange] = useState<'all' | 'week' | 'month'>('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const withinRange = (dateStr: string) => {
    if (range === 'all') return true;
    const today = new Date();
    const target = new Date(dateStr);
    const diffDays = Math.ceil((target.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (range === 'week') return diffDays >= 0 && diffDays <= 7;
    if (range === 'month') return diffDays >= 0 && diffDays <= 30;
    return true;
  };

  const upcomingFilteredSorted = [...upcomingAppointments]
    .filter(apt => withinRange(apt.booking_date))
    .sort((a, b) => {
      const at = new Date(`${a.booking_date}T${(a.start_time || '00:00')}`).getTime();
      const bt = new Date(`${b.booking_date}T${(b.start_time || '00:00')}`).getTime();
      return sort === 'asc' ? at - bt : bt - at;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FFB900] border-t-transparent mb-4"></div> {/* Changed from blue to custom yellow */}
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-center mb-4">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-red-600 mb-4">{error}</p>
          </div>
          <button
            onClick={refreshHistory}
            className="bg-[#FFB900] text-black px-6 py-3 rounded-lg hover:bg-[#E28E00] transition-colors font-medium shadow-md" // Changed from blue to custom yellow
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-white px-6 py-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Appointment History</h1>
        <p className="text-center text-gray-600">Track your government service appointments</p>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500">Your appointment history will appear here once you book services</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Upcoming Appointments Section (improved responsive UI) */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                {/* Section header with title, count, filters */}
                <div className="p-4 sm:p-5 border-b border-gray-100">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                        <span className="bg-[#FFB900] text-black px-2 py-0.5 rounded-full text-xs font-medium"> {/* Changed from blue to custom yellow */}
                          {upcomingAppointments.length}
                        </span>
                      </div>

                      {/* Sort toggle (desktop) */}
                      <button
                        type="button"
                        onClick={() => setSort(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                        aria-label="Toggle sort order"
                        title={`Sort ${sort === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        {sort === 'asc' ? 'Oldest first' : 'Newest first'}
                      </button>
                    </div>

                    {/* Filters row (mobile-friendly horizontal chips) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 px-2">
                          <Filter className="w-3.5 h-3.5" /> Filter
                        </span>
                        <button
                          type="button"
                          onClick={() => setRange('all')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            range === 'all'
                              ? 'bg-[#FFB900] text-black border-[#FFB900]' // Changed from blue to custom yellow
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setRange('week')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            range === 'week'
                              ? 'bg-[#FFB900] text-black border-[#FFB900]' // Changed from blue to custom yellow
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Next 7 days
                        </button>
                        <button
                          type="button"
                          onClick={() => setRange('month')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            range === 'month'
                              ? 'bg-[#FFB900] text-black border-[#FFB900]' // Changed from blue to custom yellow
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Next 30 days
                        </button>
                      </div>

                      {/* Sort toggle (mobile) */}
                      <button
                        type="button"
                        onClick={() => setSort(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="sm:hidden inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 transition-colors flex-shrink-0"
                        aria-label="Toggle sort order"
                        title={`Sort ${sort === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        {sort === 'asc' ? 'Oldest' : 'Newest'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards grid/list */}
                <div className="p-4 sm:p-5">
                  {upcomingFilteredSorted.length === 0 ? (
                    <div className="text-center py-10">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm sm:text-base">
                        No appointments in the selected range.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                      {upcomingFilteredSorted.map((appointment) => (
                        <AppointmentCard
                          key={appointment.slot_id}
                          appointment={appointment}
                          onRate={rateAppointment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completed Appointments Section */}
            {completedAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Completed Appointments</h2>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {completedAppointments.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {completedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.slot_id}
                      appointment={appointment}
                      onRate={rateAppointment}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Appointments Section */}
            {otherAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Other Appointments</h2>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {otherAppointments.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {otherAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.slot_id}
                      appointment={appointment}
                      onRate={rateAppointment}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
