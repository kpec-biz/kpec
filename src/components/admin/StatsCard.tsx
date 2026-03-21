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
    positive: "text-green-600",
    negative: "text-red-500",
    neutral: "text-gray-400",
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:-translate-y-0.5 hover:shadow-md hover:border-[#1A56A8] transition-all cursor-default">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
