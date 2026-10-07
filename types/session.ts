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
