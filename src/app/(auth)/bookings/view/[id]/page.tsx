import { getBookingById } from './data';
import { notFound } from 'next/navigation';
import BookingViewPageClient from './BookingViewPageClient';

export default async function BookingViewPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking) {
    notFound();
  }
  // Render the client wrapper
  return <BookingViewPageClient booking={booking} />;
} 