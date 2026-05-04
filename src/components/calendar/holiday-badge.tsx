import type { Holiday } from "@/hooks/use-holidays";

const COUNTRY_COLORS: Record<string, { bg: string; text: string }> = {
  IT: { bg: "bg-red-50", text: "text-red-700" },
  DE: { bg: "bg-yellow-50", text: "text-yellow-800" },
  FR: { bg: "bg-blue-50", text: "text-blue-700" },
  GB: { bg: "bg-indigo-50", text: "text-indigo-700" },
  US: { bg: "bg-purple-50", text: "text-purple-700" },
  NL: { bg: "bg-orange-50", text: "text-orange-700" },
  CH: { bg: "bg-rose-50", text: "text-rose-700" },
};

export function HolidayBadge({ holiday }: { holiday: Holiday }) {
  const colors = COUNTRY_COLORS[holiday.country] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  };
  return (
    <span
      title={`${holiday.nameLocal} (${holiday.country})`}
      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
    >
      {holiday.country}
    </span>
  );
}
