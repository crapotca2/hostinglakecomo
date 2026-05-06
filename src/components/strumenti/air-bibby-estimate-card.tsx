interface AirBibbyEstimateCardProps {
  children: React.ReactNode;
}

export function AirBibbyEstimateCard({ children }: AirBibbyEstimateCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-6">{children}</div>
    </div>
  );
}
