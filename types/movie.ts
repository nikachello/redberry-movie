export type Kind = "film" | "event";
export type Code = "G" | "PG" | "12+" | "16+" | "18+";

export type Format = {
  id: number;
  slug: string;
  name: string;
  priceUpLift: number;
};

export type Genre = {
  id: number;
  slug: string;
  name: string;
};

export type AgeRating = {
  code: Code;
  minAge: number;
  description: string;
};

export type Movie = {
  id: number;
  slug: string;
  title: string;
  kind: Kind;
  runtimeMinutes: number;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  isComingSoon: boolean;
  isFeatured: boolean;
  fromPrice: number;
  ageRating: AgeRating;
  genres: Genre[];
  formats: Format[];
};

export type MovieWithSynopsis = Movie & {
  synopsis: string;
};

export type MovieDetail = MovieWithSynopsis & {
  isNotified: boolean;
  director: string;
  cast: string;
  availableDates: string[];
};
