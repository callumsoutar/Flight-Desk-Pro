import { createClient } from '@/lib/supabaseServerClient';
import { Booking, User, Aircraft, FlightType, Lesson, BookingDetails } from '@/types/bookings';

// Composite type for getBookingById return value
export type BookingWithDetails = Omit<Booking, 'aircraft' | 'member' | 'instructor' | 'flight_type' | 'lesson' | 'bookingDetails'> & {
  aircraft?: Aircraft;
  member?: User;
  instructor?: User;
  flight_type?: FlightType;
  lesson?: Lesson;
  bookingDetails?: BookingDetails;
};

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const supabase = await createClient();
  // 1. Fetch booking by id (no joins)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, organization_id, aircraft_id, user_id, instructor_id, start_time, end_time, status, purpose, remarks, hobbs_start, hobbs_end, tach_start, tach_end, created_at, updated_at, flight_type_id, lesson_id, booking_type, briefing_completed')
    .eq('id', id)
    .single();
  if (bookingError) {
    console.error('[DEBUG booking fetch] Error:', JSON.stringify(bookingError, null, 2));
    return null;
  }
  console.log('[DEBUG booking fetch] Data:', JSON.stringify(booking, null, 2));

  // 2. Fetch aircraft by aircraft_id
  let aircraft = undefined;
  if (booking && booking.aircraft_id) {
    const { data: aircraftData, error: aircraftError } = await supabase
      .from('aircraft')
      .select('id, registration, type, model')
      .eq('id', booking.aircraft_id)
      .single();
    if (aircraftError) {
      console.error('[DEBUG aircraft fetch] Error:', JSON.stringify(aircraftError, null, 2));
    } else {
      console.log('[DEBUG aircraft fetch] Data:', JSON.stringify(aircraftData, null, 2));
    }
    aircraft = aircraftData || undefined;
  }

  // 3. Fetch member user
  let member: User | undefined = undefined;
  if (booking && booking.user_id) {
    const { data: memberData, error: memberError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url')
      .eq('id', booking.user_id)
      .single<Record<string, unknown>>();
    if (memberError) {
      console.error('[DEBUG member fetch] Error:', JSON.stringify(memberError, null, 2));
    } else {
      console.log('[DEBUG member fetch] Data:', JSON.stringify(memberData, null, 2));
    }
    member = memberData ? (memberData as unknown as User) : undefined;
  }

  // 4. Fetch instructor user
  let instructor: User | undefined = undefined;
  if (booking && booking.instructor_id) {
    const { data: instructorData, error: instructorError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url')
      .eq('id', booking.instructor_id)
      .single<Record<string, unknown>>();
    if (instructorError) {
      console.error('[DEBUG instructor fetch] Error:', JSON.stringify(instructorError, null, 2));
    } else {
      console.log('[DEBUG instructor fetch] Data:', JSON.stringify(instructorData, null, 2));
    }
    instructor = instructorData ? (instructorData as unknown as User) : undefined;
  }

  // 5. Fetch flight type by flight_type_id
  let flight_type = undefined;
  if (booking && booking.flight_type_id) {
    const { data: flightTypeData, error: flightTypeError } = await supabase
      .from('flight_types')
      .select('id, name')
      .eq('id', booking.flight_type_id)
      .single();
    if (flightTypeError) {
      console.error('[DEBUG flight_type fetch] Error:', JSON.stringify(flightTypeError, null, 2));
    } else {
      console.log('[DEBUG flight_type fetch] Data:', JSON.stringify(flightTypeData, null, 2));
    }
    flight_type = flightTypeData || undefined;
  }

  // 6. Fetch lesson by lesson_id
  let lesson: Lesson | undefined = undefined;
  if (booking && booking.lesson_id) {
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id, name, description, organization_id')
      .eq('id', booking.lesson_id)
      .single<Record<string, unknown>>();
    if (lessonError) {
      console.error('[DEBUG lesson fetch] Error:', JSON.stringify(lessonError, null, 2));
    } else {
      console.log('[DEBUG lesson fetch] Data:', JSON.stringify(lessonData, null, 2));
    }
    lesson = lessonData ? (lessonData as unknown as Lesson) : undefined;
  }

  // 7. Fetch booking_details by booking_id
  let bookingDetails = undefined;
  if (booking && booking.id) {
    const { data: detailsData, error: detailsError } = await supabase
      .from('booking_details')
      .select('*')
      .eq('booking_id', booking.id)
      .maybeSingle();
    if (detailsError) {
      console.error('[DEBUG booking_details fetch] Error:', JSON.stringify(detailsError, null, 2));
    } else {
      console.log('[DEBUG booking_details fetch] Data:', JSON.stringify(detailsData, null, 2));
    }
    bookingDetails = detailsData || undefined;
  }

  // Fetch latest instructor comment for this booking
  let instructor_comment: string | null = null;
  if (booking && booking.id) {
    const { data: commentData, error: commentError } = await supabase
      .from('instructor_comments')
      .select('comment')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!commentError && commentData && commentData.comment) {
      instructor_comment = commentData.comment;
    }
  }

  return { 
    ...booking, 
    instructor_comment,
    aircraft: aircraft as Aircraft | undefined,
    member, 
    instructor, 
    flight_type, 
    lesson, 
    bookingDetails 
  };
}

export async function getBookingByIdDetailed(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  // 1. Fetch booking with no joins to avoid ambiguity
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, organization_id, aircraft_id, user_id, instructor_id, start_time, end_time, status, purpose, remarks, hobbs_start, hobbs_end, tach_start, tach_end, created_at, updated_at, flight_type_id, lesson_id, booking_type, briefing_completed
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getBookingById] Supabase error:', JSON.stringify(error, null, 2));
    console.error('[getBookingById] Query params:', { id });
    return null;
  }
  if (!data) {
    console.warn('[getBookingById] No data returned for booking id:', id);
    return null;
  }
  console.debug('[getBookingById] Raw data:', JSON.stringify(data, null, 2));

  // Map fields to expected keys
  const d = data as Record<string, unknown>;
  // Fetch latest instructor comment for this booking
  let instructor_comment: string | null = null;
  if (d['id']) {
    const { data: commentData, error: commentError } = await supabase
      .from('instructor_comments')
      .select('comment')
      .eq('booking_id', d['id'] as string)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!commentError && commentData && commentData.comment) {
      instructor_comment = commentData.comment;
    }
  }
  const mapped = {
    id: d['id'] as string,
    organization_id: d['organization_id'] as string,
    aircraft_id: d['aircraft_id'] as string,
    user_id: d['user_id'] as string,
    instructor_id: d['instructor_id'] as string | null,
    start_time: d['start_time'] as string,
    end_time: d['end_time'] as string,
    status: d['status'] as import('@/types/bookings').BookingStatus,
    purpose: d['purpose'] as string,
    remarks: d['remarks'] as string | null,
    hobbs_start: d['hobbs_start'] as number | null,
    hobbs_end: d['hobbs_end'] as number | null,
    tach_start: d['tach_start'] as number | null,
    tach_end: d['tach_end'] as number | null,
    created_at: d['created_at'] as string,
    updated_at: d['updated_at'] as string,
    flight_type_id: d['flight_type_id'] as string | null,
    lesson_id: d['lesson_id'] as string | null,
    booking_type: d['booking_type'] as import('@/types/bookings').BookingType,
    briefing_completed: d['briefing_completed'] as boolean,
    instructor_comment,
    aircraft: undefined,
    flight_type: undefined,
    lesson: undefined,
    debriefs: [] as import('@/types/bookings').Debrief[],
  };

  // 2. Fetch aircraft by aircraft_id
  let aircraft: Aircraft | undefined = undefined;
  if (mapped.aircraft_id) {
    const { data: aircraftData, error: aircraftError } = await supabase
      .from('aircraft')
      .select('id, registration, type, model, current_tach, current_hobbs')
      .eq('id', mapped.aircraft_id)
      .single();
    if (aircraftError) {
      console.error('[getBookingById] Error fetching aircraft:', JSON.stringify(aircraftError, null, 2));
    }
    if (aircraftData) {
      aircraft = {
        id: aircraftData.id,
        registration: aircraftData.registration,
        type: aircraftData.type,
        model: aircraftData.model,
        current_tach: aircraftData.current_tach ?? 0,
        current_hobbs: aircraftData.current_hobbs ?? 0,
      };
    }
  }

  // 3. Fetch member and instructor users by their IDs
  let member: User | undefined = undefined;
  let instructor: User | undefined = undefined;
  if (mapped.user_id) {
    const { data: memberData, error: memberError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url')
      .eq('id', mapped.user_id)
      .single<Record<string, unknown>>();
    if (memberError) {
      console.error('[getBookingById] Error fetching member user:', JSON.stringify(memberError, null, 2));
    }
    member = memberData ? (memberData as unknown as User) : undefined;
  }
  if (mapped.instructor_id) {
    const { data: instructorData, error: instructorError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url')
      .eq('id', mapped.instructor_id)
      .single<Record<string, unknown>>();
    if (instructorError) {
      console.error('[getBookingById] Error fetching instructor user:', JSON.stringify(instructorError, null, 2));
    }
    instructor = instructorData ? (instructorData as unknown as User) : undefined;
  }

  // Build the Booking object explicitly
  const booking: Booking = {
    ...mapped,
    aircraft,
    member,
    instructor,
  };
  return booking;
} 