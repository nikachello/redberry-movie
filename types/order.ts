import type { Session } from "@/types/session";

export type TicketType = {
  id: number;
  slug: string;
  name: string;
  priceRatio: number;
  note: string | null;
  blockedFromRatingAge: number | null;
};

export type CreateOrderPayload = {
  holdId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type OrderTicket = {
  id: number;
  seatCode: string;
  ticketType: {
    slug: string;
    name: string;
  };
  price: number;
};

export type OrderContact = {
  fullName: string;
  email: string;
  mobileNumber: string;
};

export type Order = {
  id: number;
  reference: string;
  status: "paid" | "refunded";
  totalPrice: number;
  paidAt: string;
  refundedAt: string | null;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string;

  contact: OrderContact;

  session: Session & {
    startsAt: string;
    movie: {
      id: number;
      slug: string;
      title: string;
      kind: string;
      runtimeMinutes: number;
      posterUrl: string;
      backdropUrl: string;
      releaseDate: string;
      isComingSoon: boolean;
      isFeatured: boolean;
      fromPrice: number;
      ageRating: {
        code: string;
        minAge: number;
        description: string;
      } | null;
      genres: {
        id: number;
        slug: string;
        name: string;
      }[];
      formats: {
        id: number;
        slug: string;
        name: string;
        priceUplift: number;
      }[];
    };
  };

  tickets: OrderTicket[];
};
