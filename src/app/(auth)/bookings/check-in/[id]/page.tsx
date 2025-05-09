import { getBookingById } from '../../view/[id]/data';
import { notFound } from 'next/navigation';
import { ClientBookingCheckInView } from '@/components/bookings/client-booking-check-in-view';

export default async function BookingCheckInPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }

  return (
    <ClientBookingCheckInView booking={booking} />
  );
} 