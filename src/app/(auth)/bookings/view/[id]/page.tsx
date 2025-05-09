import { getBookingById } from './data';
import { notFound } from 'next/navigation';
import { ClientBookingView } from '@/components/bookings/client-booking-view';

export default async function BookingViewPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }

  return (
    <ClientBookingView booking={booking} />
  );
} 