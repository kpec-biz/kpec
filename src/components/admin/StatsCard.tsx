interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function StatsCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBg,
  iconColor,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-emerald-600",
    negative: "text-red-500",
    neutral: "text-[#1A56A8]",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:border-[#1A56A8]/30 transition-all cursor-default">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          {change && (
            <p
              className={`text-[11px] mt-0.5 font-medium ${changeColors[changeType]}`}
            >
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
