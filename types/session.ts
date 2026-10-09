export type Format = {
  id: number;
  slug: string;
  name: string;
  priceUpLift: string;
};

export type Venue = {
  id: number;
  slug: string;
  name: string;
  city: string;
  formats: Format[];
};

export type Language = {
  id: number;
  slug: string;
  name: string;
  code: string;
};

export type SessionVenue = {
  id: number;
  slug: string;
  name: string;
  city: string;
};

export type Hall = {
  id: number;
  name: string;
  venue: SessionVenue;
};

export type Session = {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: string;
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  hall: Hall;
  venue: SessionVenue;
  format: Format;
  language: Language;
};

export type MovieSessionsGroup = {
  venue: SessionVenue;
  sessions: Session[];
};
