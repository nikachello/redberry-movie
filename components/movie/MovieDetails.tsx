import type { MovieDetail } from "@/types/movie";

type Props = {
  movie: MovieDetail;
};

export default function MovieDetails({ movie }: Props) {
  const releaseDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${movie.releaseDate}T00:00:00`));

  return (
    <aside>
      <h2 className="text-[18px] font-bold">Details</h2>

      <div className="mt-5 space-y-5">
        <Detail label="Director" value={movie.director} />

        <Detail label="Main cast" value={movie.cast} />

        <Detail label="Duration" value={`${movie.runtimeMinutes} minutes`} />

        <Detail
          label="Genres"
          value={movie.genres.map((genre) => genre.name).join(", ")}
        />

        <Detail label="Release date" value={releaseDate} />

        <Detail
          label="Formats"
          value={movie.formats.map((format) => format.name).join(", ")}
        />

        <Detail label="From" value={`₾${movie.fromPrice}`} />
      </div>

      <div className="mt-6 rounded-[10px] bg-orange-500/10 p-4">
        <p className="text-[11px] font-bold uppercase text-orange-400">
          Rating note
        </p>

        <p className="mt-1 text-[11px] leading-4 text-orange-300/80">
          {movie.ageRating.code} · {movie.ageRating.description}
        </p>
      </div>
    </aside>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-white/40">{label}</p>

      <p className="mt-1 text-[12px] leading-4 text-white">{value}</p>
    </div>
  );
}
