const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  draft: { bg: "bg-yellow-50", text: "text-yellow-700", label: "임시저장" },
  published: { bg: "bg-green-50", text: "text-green-700", label: "게시중" },
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", label: "대기" },
  new: { bg: "bg-red-50", text: "text-red-600", label: "신규" },
  progress: { bg: "bg-blue-50", text: "text-blue-700", label: "진행중" },
  complete: { bg: "bg-green-50", text: "text-green-700", label: "완료" },
  cancel: { bg: "bg-red-50", text: "text-red-700", label: "취소" },
  rewritten: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    label: "리라이팅완료",
  },
  generating: { bg: "bg-orange-50", text: "text-orange-700", label: "생성중" },
  review: { bg: "bg-yellow-50", text: "text-yellow-700", label: "검토" },
  scheduled: { bg: "bg-cyan-50", text: "text-cyan-700", label: "예약" },
  posted: { bg: "bg-green-50", text: "text-green-700", label: "게재완료" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
