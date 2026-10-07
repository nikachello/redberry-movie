import type { Format } from "./movie";

export type Venue = {
  id: number;
  slug: string;
  name: string;
  city: string;
  formats: Format[];
};
