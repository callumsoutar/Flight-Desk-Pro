'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingCheckInSchema, BookingCheckInForm } from '@/validation/booking-checkin-schema';
import { Booking } from '@/types/bookings';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabaseBrowserClient';
import { useState, useEffect } from 'react';
import { CalendarClock, Gauge, Timer } from 'lucide-react';
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Helper to safely stringify unknown error
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Could not load rate';
}

export function BookingCheckInCard({ booking, onSuccess, onCalculateCharges }: { booking: Booking; onSuccess?: () => void; onCalculateCharges?: (items: { description: string; quantity: number; rate: number; total: number; }[]) => void }) {
  const hobbsStart = booking.hobbs_start ?? 0;
  const tachStart = booking.tach_start ?? 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BookingCheckInForm>({
    resolver: zodResolver(bookingCheckInSchema),
    defaultValues: {
      hobbs_start: hobbsStart,
      tach_start: tachStart,
      hobbs_end: booking.hobbs_end ?? hobbsStart,
      tach_end: booking.tach_end ?? tachStart,
    },
  });

  // Fetch flight type and rate
  const supabase = createClient();
  const {
    data: rateData,
    isLoading: rateLoading,
    error: rateError,
  } = useQuery({
    queryKey: ['aircraft_charge_rate', booking.aircraft_id, booking.flight_type_id],
    queryFn: async () => {
      if (!booking.aircraft_id || !booking.flight_type_id) return null;
      // Get flight type name
      const { data: flightType, error: ftErr } = await supabase
        .from('flight_types')
        .select('id, name')
        .eq('id', booking.flight_type_id)
        .single();
      if (ftErr) throw ftErr;
      // Get rate and charge flags
      const { data: rateRow, error: rateErr } = await supabase
        .from('aircraft_charge_rates')
        .select('rate_per_hour, charge_hobbs, charge_tacho, charge_airswitch')
        .eq('aircraft_id', booking.aircraft_id)
        .eq('flight_type_id', booking.flight_type_id)
        .single();
      if (rateErr) throw rateErr;
      return {
        flightTypeName: flightType.name,
        rate: rateRow.rate_per_hour,
        charge_hobbs: rateRow.charge_hobbs,
        charge_tacho: rateRow.charge_tacho,
        charge_airswitch: rateRow.charge_airswitch,
      };
    },
    enabled: !!booking.aircraft_id && !!booking.flight_type_id,
  });

  // Instructor dropdown state
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(booking.instructor_id ?? null);

  // Fetch instructors for the org (user_organizations + users)
  const { data: instructors, isLoading: instructorsLoading, error: instructorsError } = useQuery({
    queryKey: ['instructors', booking.organization_id],
    queryFn: async () => {
      if (!booking.organization_id) return [];
      const supabase = createClient();
      // 1. Get all users in the org (user_organizations + users)
      const { data: orgUsers, error: orgUsersErr } = await supabase
        .from('user_organizations')
        .select('user_id, users(first_name, last_name, email)')
        .eq('organization_id', booking.organization_id);
      if (orgUsersErr) throw orgUsersErr;
      // 2. Get all instructor rates for org
      const { data: ratesRows, error: ratesErr } = await supabase
        .from('instructor_rates')
        .select('user_id, rate')
        .eq('organization_id', booking.organization_id);
      if (ratesErr) throw ratesErr;
      // 3. Merge: Only include users who have a rate
      type OrgUser = { user_id: string; users: { first_name?: string; last_name?: string; email: string } };
      const merged = ((orgUsers ?? []) as unknown as OrgUser[])
        .map((row) => {
          // Defensive: if users is an array, take the first element; otherwise use as object
          const user = Array.isArray(row.users) ? row.users[0] : row.users;
          if (!user || !user.email) return null;
          const rate = (ratesRows as { user_id: string; rate: number | null }[]).find((r) => r.user_id === row.user_id)?.rate ?? null;
          return {
            id: row.user_id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            email: user.email,
            rate,
          };
        })
        .filter((u): u is { id: string; name: string; email: string; rate: number | null } => !!u && u.rate !== null && u.rate !== undefined);
      // Debug: log merged instructors
      console.log('Merged instructors with rates:', merged);
      return merged;
    },
    enabled: !!booking.organization_id,
  });

  // Debug: log instructors and selected instructor before rendering
  console.log('instructors:', instructors);
  console.log('selectedInstructor:', selectedInstructor);
  if (instructors && selectedInstructor) {
    const found = Array.isArray(instructors)
      ? (instructors as { id: string; name: string; rate: number | null }[]).find((i) => i.id === selectedInstructor)
      : undefined;
    console.log('Found instructor:', found);
  }

  // When instructor changes, update booking.instructor_id (optimistically, or via API as needed)
  useEffect(() => {
    // Optionally, update booking.instructor_id in parent or via API
  }, [selectedInstructor]);

  // Fetch all available aircraft charge rates for this aircraft/org
  const { data: chargeRates, isLoading: chargeRatesLoading, error: chargeRatesError } = useQuery({
    queryKey: ['aircraft_charge_rates', booking.aircraft_id, booking.organization_id],
    queryFn: async () => {
      if (!booking.aircraft_id || !booking.organization_id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('aircraft_charge_rates')
        .select('id, rate_per_hour, flight_type_id, charge_hobbs, charge_tacho, charge_airswitch, flight_types(name)')
        .eq('aircraft_id', booking.aircraft_id)
        .eq('organization_id', booking.organization_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!booking.aircraft_id && !!booking.organization_id,
  });

  // State for selected charge rate
  const [selectedChargeRateId, setSelectedChargeRateId] = useState<string | null>(null);
  // Set default selected charge rate to booking.flight_type_id if present
  useEffect(() => {
    if (!selectedChargeRateId && chargeRates && booking.flight_type_id) {
      const found = chargeRates.find((r: { flight_type_id: string }) => r.flight_type_id === booking.flight_type_id);
      if (found) setSelectedChargeRateId(found.id);
    }
  }, [chargeRates, booking.flight_type_id, selectedChargeRateId]);

  // Find the selected charge rate object
  const selectedChargeRate = chargeRates?.find((r: { id: string }) => r.id === selectedChargeRateId) ?? null;

  // Fetch the default briefing chargeable for the org
  const { data: briefingChargeable } = useQuery({
    queryKey: ['default_briefing_chargeable', booking.organization_id],
    queryFn: async () => {
      if (!booking.organization_id) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chargeables')
        .select('id, name, description, rate')
        .eq('organization_id', booking.organization_id)
        .eq('type', 'default_briefing')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!booking.organization_id,
  });

  const onSubmit = async (data: BookingCheckInForm) => {
    const res = await fetch(`/api/bookings/${booking.id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hobbs_end: data.hobbs_end, tach_end: data.tach_end }),
    });
    if (res.ok) {
      toast.success('Check-in successful!');
      onSuccess?.();
    } else {
      const result = await res.json();
      toast.error(result.error || 'Check-in failed');
    }
  };

  // Calculate hobbs and tacho time differences
  const hobbsTime = (watch('hobbs_end') ?? 0) - (watch('hobbs_start') ?? 0);
  const tachoTime = (watch('tach_end') ?? 0) - (watch('tach_start') ?? 0);

  // Calculate charges handler
  const handleCalculateCharges = () => {
    if (!selectedChargeRate || !instructors) return;
    // Determine which meter to use for aircraft charge
    let flightTime = 0;
    if (selectedChargeRate.charge_hobbs) {
      flightTime = hobbsTime;
    } else if (selectedChargeRate.charge_tacho) {
      flightTime = tachoTime;
    } else {
      // Default fallback (could add airswitch logic here)
      flightTime = hobbsTime;
    }
    // Get aircraft registration
    const aircraftReg = booking.aircraft?.registration || 'Unknown';
    const aircraftCharge = {
      description: `Aircraft Hire - ${aircraftReg}`,
      quantity: Number(flightTime.toFixed(2)),
      rate: selectedChargeRate.rate_per_hour,
      total: Number((flightTime * selectedChargeRate.rate_per_hour).toFixed(2)),
    };
    // Instructor charge (if selected)
    let instructorCharge = null;
    if (selectedInstructor) {
      const found = instructors.find((i: { id: string; name: string; rate: number | null }) => i.id === selectedInstructor);
      if (found && found.rate !== null && found.rate !== undefined) {
        instructorCharge = {
          description: `Instructor - ${found.name}`,
          quantity: Number(flightTime.toFixed(2)),
          rate: Number(found.rate),
          total: Number((flightTime * Number(found.rate)).toFixed(2)),
        };
      }
    }
    const items = instructorCharge ? [aircraftCharge, instructorCharge] : [aircraftCharge];
    // Add default briefing line item if briefing_completed is true and chargeable found
    if (booking.briefing_completed && briefingChargeable) {
      items.push({
        description: briefingChargeable.name || 'Briefing',
        quantity: 1,
        rate: Number(briefingChargeable.rate),
        total: Number(briefingChargeable.rate),
      });
      toast.info('A default briefing charge has been automatically added to this invoice.');
    }
    // 20% difference check
    let error: string | null = null;
    const min = Math.min(Math.abs(hobbsTime), Math.abs(tachoTime));
    const max = Math.max(Math.abs(hobbsTime), Math.abs(tachoTime));
    if (min > 0 && max / min > 1.2) {
      error = 'Tacho and Hobbs vary by more than 20%';
    }
    setCalcResult({ items, hobbsTime, tachoTime, error });
    setCalculated(true);
    onCalculateCharges?.(items);
  };

  // Calculate flight time and charge for summary
  const flightTime = booking.hobbs_end && booking.hobbs_start ? booking.hobbs_end - booking.hobbs_start : 0;
  const charge = rateData && flightTime > 0 ? flightTime * rateData.rate : 0;

  const [calculated, setCalculated] = useState(false);
  const [calcResult, setCalcResult] = useState<{ items: { description: string; quantity: number; rate: number; total: number; }[], hobbsTime: number, tachoTime: number, error: string | null } | null>(null);

  return (
    <Card className="bg-white/95 border border-slate-100 rounded-2xl p-4 w-full max-w-md mx-auto flex flex-col items-start shadow-sm">
      <h2 className="text-lg font-bold mb-2">Check-In Details</h2>
      {/* Aircraft Charge Rate Dropdown */}
      <div className="w-full mb-1">
        <label className="block text-xs font-semibold mb-1 text-slate-700">Aircraft Charge Rate</label>
        <ShadcnSelect
          value={selectedChargeRateId ?? ''}
          onValueChange={setSelectedChargeRateId}
          disabled={chargeRatesLoading || !chargeRates || chargeRates.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select flight type..." />
          </SelectTrigger>
          <SelectContent>
            {chargeRates && (chargeRates as { id: string; flight_types?: { name?: string }; rate_per_hour: number }[]).map((typedRate) => (
              <SelectItem key={typedRate.id} value={typedRate.id}>
                {typedRate.flight_types?.name || 'Unknown'} - ${Number(typedRate.rate_per_hour * 1.15).toFixed(2)} / hour
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
        {chargeRatesLoading && <span className="text-xs text-muted-foreground">Loading rates...</span>}
        {Boolean(chargeRatesError) && <span className="text-xs text-red-500">{String(getErrorMessage(chargeRatesError))}</span>}
      </div>
      {/* Instructor Dropdown */}
      <div className="w-full mb-1">
        <label className="block text-xs font-semibold mb-1 text-slate-700">Instructor</label>
        <ShadcnSelect
          value={selectedInstructor ?? ''}
          onValueChange={setSelectedInstructor}
          disabled={instructorsLoading || !instructors || instructors.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select instructor..." />
          </SelectTrigger>
          <SelectContent>
            {instructors && (instructors as { id: string; name: string; rate: number | null }[]).map((inst) => (
              <SelectItem key={inst.id} value={inst.id}>
                {inst.name} - {inst.rate !== null ? `$${Number(inst.rate * 1.15).toFixed(2)} / hour` : 'No rate'}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
        {instructorsLoading && <span className="text-xs text-muted-foreground">Loading instructors...</span>}
        {Boolean(instructorsError) && <span className="text-xs text-red-500">{String(getErrorMessage(instructorsError))}</span>}
      </div>
      {/* Hobbs/Tacho Section */}
      <div className="w-full mt-2 flex flex-col gap-1">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="relative">
              <label className="block text-sm font-bold mb-1 text-slate-700">Start Hobbs</label>
              <span className="absolute left-2 top-7 text-slate-400"><Gauge size={16} /></span>
              <Input value={hobbsStart} readOnly className="bg-slate-100 text-xs h-10 pl-8 rounded-full w-full focus:ring-2 focus:ring-blue-400" />
              <div className="text-[10px] text-slate-500 mt-1 ml-1">Total: {hobbsTime.toFixed(2)}</div>
            </div>
            <div className="relative">
              <label className="block text-sm font-bold mb-1 text-slate-700">End Hobbs</label>
              <span className="absolute left-2 top-7 text-slate-400"><Gauge size={16} /></span>
              <Input
                type="number"
                step="0.01"
                {...register('hobbs_end', { valueAsNumber: true })}
                min={hobbsStart}
                required
                className="text-xs h-10 pl-8 rounded-full w-full focus:ring-2 focus:ring-blue-400"
              />
              {errors.hobbs_end && (
                <span className="text-red-500 text-xs absolute left-0 -bottom-4">{errors.hobbs_end.message}</span>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-bold mb-1 text-slate-700">Start Tacho</label>
              <span className="absolute left-2 top-7 text-slate-400"><Timer size={16} /></span>
              <Input value={tachStart} readOnly className="bg-slate-100 text-xs h-10 pl-8 rounded-full w-full focus:ring-2 focus:ring-blue-400" />
              <div className="text-[10px] text-slate-500 mt-1 ml-1">Total: {tachoTime.toFixed(2)}</div>
            </div>
            <div className="relative">
              <label className="block text-sm font-bold mb-1 text-slate-700">End Tacho</label>
              <span className="absolute left-2 top-7 text-slate-400"><Timer size={16} /></span>
              <Input
                type="number"
                step="0.01"
                {...register('tach_end', { valueAsNumber: true })}
                min={tachStart}
                required
                className="text-xs h-10 pl-8 rounded-full w-full focus:ring-2 focus:ring-blue-400"
              />
              {errors.tach_end && (
                <span className="text-red-500 text-xs absolute left-0 -bottom-4">{errors.tach_end.message}</span>
              )}
            </div>
          </div>
          <input type="hidden" {...register('hobbs_start')} value={hobbsStart} />
          <input type="hidden" {...register('tach_start')} value={tachStart} />
          {/* Add more vertical space above the button */}
          <div className="mt-2 flex items-center gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-full font-semibold text-sm h-10 border-blue-500 text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 cursor-pointer"
              onClick={handleCalculateCharges}
              disabled={isSubmitting || !selectedChargeRate}
            >
              <Gauge size={16} className="inline-block mr-2 -mt-0.5 text-blue-500" />
              Calculate Flight Charges
            </Button>
          </div>
        </form>
      </div>
      {/* Only show calculations after button is clicked */}
      {calculated && calcResult && calcResult.error && (
        <div className="w-full flex flex-col items-center mt-4 mb-2">
          <div className="text-xs text-red-500 mt-2">{calcResult.error}</div>
        </div>
      )}
      {/* Summary Row */}
      <div className="w-full flex flex-col items-center mt-4 mb-2">
        {rateData && flightTime > 0 && (
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <CalendarClock size={16} className="text-blue-500" />
              <span>Flight Time:</span>
              <span className="font-semibold">{flightTime.toFixed(2)} hrs</span>
              <span className="mx-2">|</span>
              <span>Charge:</span>
              <span className="font-semibold text-green-600">${charge.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
      {/* Flight Type and Rate Display */}
      <div className="mt-1 flex flex-col items-center gap-1 w-full">
        {rateLoading && <span className="text-xs text-muted-foreground">Loading rate...</span>}
        {Boolean(rateError) && (
          <span className="text-xs text-red-500">{String(getErrorMessage(rateError))}</span>
        )}
      </div>
    </Card>
  );
} 