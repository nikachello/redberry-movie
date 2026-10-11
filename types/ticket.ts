import type { Format, Movie } from "@/types/movie";
import type { Language } from "@/types/session";

export type TicketOrder = {
  id: number;
  reference: string;
  status: string;
  totalPrice: number;
  paidAt: string | null;
  refundedAt: string | null;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string | null;
  contact: {
    fullName: string;
    email: string;
    mobileNumber: string;
  };
  session: {
    id: number;
    startsAt: string;
    date: string;
    time: string;
    timeBand: string;
    price: number;
    seatsLeft: number;
    isSoldOut: boolean;
    hall: {
      id: number;
      name: string;
    };
    venue: {
      id: number;
      slug: string;
      name: string;
      city: string;
    };
    format: Format;
    language: Language;
    movie: Movie;
  };
  tickets: {
    id: number;
    seatCode: string;
    ticketType: {
      slug: string;
      name: string;
    };
    price: number;
  }[];
};
