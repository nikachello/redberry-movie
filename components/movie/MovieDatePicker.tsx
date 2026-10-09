type DateOption = {
  date: string;
  day: string;
  dayNumber: string;
  available: boolean;
};

type Props = {
  dates: DateOption[];
  selectedDate: string;
  onSelect: (date: string) => void;
};

export default function MovieDatePicker({
  dates,
  selectedDate,
  onSelect,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {dates.map((item) => {
        const selected = item.date === selectedDate;

        return (
          <button
            key={item.date}
            type="button"
            disabled={!item.available}
            onClick={() => onSelect(item.date)}
            className={`flex h-[70px] min-w-[70px] flex-col items-center justify-center rounded-[12px] transition-colors ${
              selected ? "bg-white text-[#070b19]" : "bg-[#171c30] text-white"
            } ${
              item.available
                ? "cursor-pointer hover:bg-white/20"
                : "cursor-not-allowed opacity-35"
            }`}
          >
            <span className="text-[10px] font-medium">{item.day}</span>

            <span className="mt-1 text-[15px] font-bold">{item.dayNumber}</span>
          </button>
        );
      })}
    </div>
  );
}
