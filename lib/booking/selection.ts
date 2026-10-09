import type { SelectedSeat } from "@/types/booking";
import type { TicketType } from "@/types/order";

export function isTicketTypeAllowed(type: TicketType, minimumAge?: number) {
  return type.blockedFromRatingAge == null || minimumAge == null ||
    minimumAge < type.blockedFromRatingAge;
}

export function validateSelection(
  seats: SelectedSeat[], ticketTypes: TicketType[], maxSeats?: number, minimumAge?: number,
): string | null {
  if (!seats.length) return "Please select at least one seat.";
  if (maxSeats === undefined || !ticketTypes.length) return "Booking settings are not available.";
  if (seats.length > maxSeats) return `You can select a maximum of ${maxSeats} seats.`;
  for (const seat of seats) {
    const type = ticketTypes.find((item) => item.slug === seat.ticketTypeSlug);
    if (!type) return `Seat ${seat.code}: please select a valid ticket type.`;
    if (!isTicketTypeAllowed(type, minimumAge)) {
      return `Seat ${seat.code}: ${type.name} tickets are not available for this movie.`;
    }
  }
  return null;
}
