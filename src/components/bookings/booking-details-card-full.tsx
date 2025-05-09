'use client';
import { Booking } from '@/types/bookings';
import { format } from 'date-fns';
import { CalendarDays, Plane, FileText, StickyNote, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabaseBrowserClient';
import { toast } from 'sonner';
import { DatePicker, TimeSelect } from '@/components/ui/date-time-picker';

interface AircraftOption { id: string; registration: string; type: string; model: string; organization_id: string; }
interface FlightTypeOption { id: string; name: string; organization_id: string; }
interface LessonOption { id: string; name: string; organization_id: string; }

export function BookingDetailsCardFull({ booking, editMode }: { booking: Booking; editMode: boolean }) {
  const initialFormRef = useRef({
    start_time: booking.start_time ? new Date(booking.start_time) : null,
    end_time: booking.end_time ? new Date(booking.end_time) : null,
    aircraft_id: booking.aircraft?.id || '',
    flight_type_id: booking.flight_type?.id || '',
    booking_type: booking.booking_type || '',
    lesson_id: booking.lesson?.id || '',
    purpose: booking.purpose || '',
    bookingRemarks: booking.remarks || '',
  });
  const [form, setForm] = useState(initialFormRef.current);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [flightTypeOptions, setFlightTypeOptions] = useState<FlightTypeOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const supabase = createClient();
      // Fetch all aircraft for the org (no filtering for busy aircraft)
      const { data: aircrafts } = await supabase
        .from('aircraft')
        .select('id, registration, type, model, organization_id')
        .eq('organization_id', booking.organization_id);
      setAircraftOptions(aircrafts || []);
      // Fetch flight types
      const { data: flightTypes } = await supabase
        .from('flight_types')
        .select('id, name, organization_id')
        .eq('organization_id', booking.organization_id);
      setFlightTypeOptions(flightTypes || []);
      // Fetch lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, name, description, organization_id')
        .eq('organization_id', booking.organization_id);
      setLessonOptions(lessons || []);
    };
    fetchOptions();
  }, [editMode, booking.organization_id]);

  useEffect(() => {
    // Reset form state from booking prop
    const newInitial = {
      start_time: booking.start_time ? new Date(booking.start_time) : null,
      end_time: booking.end_time ? new Date(booking.end_time) : null,
      aircraft_id: booking.aircraft?.id || '',
      flight_type_id: booking.flight_type?.id || '',
      booking_type: booking.booking_type || '',
      lesson_id: booking.lesson?.id || '',
      purpose: booking.purpose || '',
      bookingRemarks: booking.remarks || '',
    };
    initialFormRef.current = newInitial;
    setForm(newInitial);
  }, [booking]);

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(initialFormRef.current);
  };

  const handleSave = async () => {
    // Debug log: form state before validation
    console.debug('BookingDetailsCardFull form state before validation:', form);
    // Client-side validation
    if (!form.start_time) {
      setError('Start time is required.');
      return;
    }
    if (!form.end_time) {
      setError('End time is required.');
      return;
    }
    if (!form.aircraft_id) {
      setError('Aircraft is required.');
      return;
    }
    if (!form.flight_type_id) {
      setError('Flight type is required.');
      return;
    }
    if (!form.booking_type) {
      setError('Booking type is required.');
      return;
    }
    if (!form.lesson_id) {
      setError('Lesson is required.');
      return;
    }
    if (!form.purpose) {
      setError('Description is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        start_time: form.start_time ? form.start_time.toISOString() : null,
        end_time: form.end_time ? form.end_time.toISOString() : null,
        aircraft_id: form.aircraft_id,
        flight_type_id: form.flight_type_id,
        booking_type: form.booking_type,
        lesson_id: form.lesson_id,
        purpose: form.purpose,
        remarks: form.bookingRemarks || null,
        status: booking.status,
      };
      console.debug('BookingDetailsCardFull save payload:', payload);
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('BookingDetailsCardFull: Failed to parse response JSON', jsonErr);
        setError('Failed to parse server response.');
        setLoading(false);
        return;
      }
      console.debug('BookingDetailsCardFull save response:', data);
      if (!res.ok) {
        setError(data.error || 'Failed to update booking');
        toast.error(data.error || 'Failed to update booking');
        setLoading(false);
        return;
      }
      toast.success('Booking updated');
      setLoading(false);
      // Optionally refresh or callback
    } catch (e: unknown) {
      const message = typeof e === 'object' && e && 'message' in e && typeof (e as { message?: string }).message === 'string'
        ? (e as { message: string }).message
        : JSON.stringify(e);
      console.error('BookingDetailsCardFull: Exception in handleSave', e);
      setError(message);
      toast.error(message || 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 w-full">
      <div className="flex items-center justify-between pb-2 gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Booking Details
        </h2>
        {editMode && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading} className="cursor-pointer">
              Undo Changes
            </Button>
            <Button variant="default" type="button" onClick={handleSave} disabled={loading} className="cursor-pointer">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 pt-2">
        {/* Scheduled Times: full width */}
        <div className="w-full">
          <div className="bg-slate-50 rounded-md p-4 flex flex-col gap-2 min-h-[96px] border border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
              <CalendarDays className="w-4 h-4 text-primary" /> Scheduled Times
            </div>
            <div className="flex flex-row gap-8 items-end">
              {/* Start Time */}
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">Start Time</div>
                {editMode ? (
                  <div className="flex gap-2">
                    <DatePicker
                      value={form.start_time}
                      onChange={(date: Date | null) => handleChange('start_time', date)}
                      placeholder="Select start date"
                    />
                    <TimeSelect
                      value={form.start_time ? format(form.start_time, 'HH:mm') : ''}
                      onChange={(time: string) => {
                        if (form.start_time) {
                          const [h, m] = time.split(':').map(Number);
                          const newDate = new Date(form.start_time);
                          newDate.setHours(h, m, 0, 0);
                          handleChange('start_time', newDate);
                        }
                      }}
                      placeholder="Start time"
                    />
                  </div>
                ) : (
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {booking.start_time && new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-0.5">
                  {booking.start_time && new Date(booking.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {/* End Time */}
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-semibold mb-0.5 uppercase tracking-wide">End Time</div>
                {editMode ? (
                  <div className="flex gap-2">
                    <DatePicker
                      value={form.end_time}
                      onChange={(date: Date | null) => handleChange('end_time', date)}
                      placeholder="Select end date"
                    />
                    <TimeSelect
                      value={form.end_time ? format(form.end_time, 'HH:mm') : ''}
                      onChange={(time: string) => {
                        if (form.end_time) {
                          const [h, m] = time.split(':').map(Number);
                          const newDate = new Date(form.end_time);
                          newDate.setHours(h, m, 0, 0);
                          handleChange('end_time', newDate);
                        }
                      }}
                      placeholder="End time"
                    />
                  </div>
                ) : (
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {booking.end_time && new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-0.5">
                  {booking.end_time && new Date(booking.end_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Aircraft & Flight Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aircraft */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <Plane className="w-4 h-4 text-primary" /> Aircraft
            </div>
            {editMode ? (
              <Select value={form.aircraft_id} onValueChange={val => handleChange('aircraft_id', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraftOptions.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.registration} {a.type && `(${a.type}${a.model ? ` – ${a.model}` : ''})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              booking.aircraft?.registration ? (
                <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center font-bold border border-slate-100">
                  {booking.aircraft.registration}
                  {booking.aircraft.type && (
                    <span className="text-sm text-slate-600 font-normal ml-2">{booking.aircraft.type}{booking.aircraft.model ? ` – ${booking.aircraft.model}` : ''}</span>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100">--</div>
              )
            )}
          </div>
          {/* Flight Type */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <Plane className="w-4 h-4 text-primary" /> Flight Type
            </div>
            {editMode ? (
              <Select value={form.flight_type_id} onValueChange={val => handleChange('flight_type_id', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Flight Type" />
                </SelectTrigger>
                <SelectContent>
                  {flightTypeOptions.map(ft => (
                    <SelectItem key={ft.id} value={ft.id}>{ft.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100">
                {booking.flight_type?.name || '--'}
              </div>
            )}
          </div>
        </div>
        {/* Lesson & Booking Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {/* Lesson */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-primary" /> Lesson
            </div>
            {editMode ? (
              <Select value={form.lesson_id} onValueChange={val => handleChange('lesson_id', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessonOptions.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100">
                {booking.lesson?.name || '--'}
              </div>
            )}
          </div>
          {/* Booking Type */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-primary" /> Booking Type
            </div>
            {editMode ? (
              <Select value={form.booking_type} onValueChange={val => handleChange('booking_type', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Booking Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="groundwork">Groundwork</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100">
                {booking.booking_type ? booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) : '--'}
              </div>
            )}
          </div>
        </div>
        {/* Booking Remarks & Description side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Booking Remarks */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <StickyNote className="w-4 h-4 text-primary" /> Booking Remarks
            </div>
            {editMode ? (
              <Textarea
                value={form.bookingRemarks}
                onChange={e => handleChange('bookingRemarks', e.target.value)}
                placeholder="Enter booking remarks"
                rows={2}
              />
            ) : (
              <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100 whitespace-pre-wrap">
                {form.bookingRemarks || '--'}
              </div>
            )}
          </div>
          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-primary" /> Description
            </div>
            {editMode ? (
              <Textarea
                value={form.purpose}
                onChange={e => handleChange('purpose', e.target.value)}
                placeholder="Enter flight purpose/description"
                rows={2}
              />
            ) : (
              <div className="bg-slate-100 rounded-md p-3 min-h-[32px] text-base text-slate-900 flex items-center border border-slate-100 whitespace-pre-wrap">
                {form.purpose || '--'}
              </div>
            )}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 whitespace-pre-wrap">{error}</div>}
      </div>
    </div>
  );
} 