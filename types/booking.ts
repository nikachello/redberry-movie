export type SelectedSeat = {
  seatId: number;
  code: string;
  ticketTypeSlug: string;
};

export type HoldSeatInput = {
  seatId: number;
  ticketType: string;
};

export type CreateHoldInput = {
  seats: HoldSeatInput[];
};

export type HeldTicketType = {
  slug: string;
  name: string;
};

export type HeldSeat = {
  seatId: number;
  code: string;
  ticketType: HeldTicketType;
  price: number;
};

export type SeatHold = {
  holdId: string;
  sessionId: number;
  expiresAt: string;
  secondsRemaining: number;
  isLive: boolean;
  subtotal: number;
  seats: HeldSeat[];
};
