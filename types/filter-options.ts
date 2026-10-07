import type { Venue } from "./venue";
import type { AgeRating, Format } from "./movie";
import type { Language } from "./session";
import { TicketType } from "./order";

export type TimeBand = {
  id: string;
  label: string;
};

export type SortOption = {
  id: string;
  label: string;
};

export type FilterOptions = {
  venues: Venue[];
  formats: Format[];
  languages: Language[];
  timeBands: TimeBand[];
  sorts: SortOption[];
  ticketTypes: TicketType[];
  ageRatings: AgeRating[];
  maxSeatsPerOrder: number;
  holdMinutes: number;
};
