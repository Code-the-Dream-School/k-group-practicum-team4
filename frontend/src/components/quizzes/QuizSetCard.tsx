import { Trash2 } from "lucide-react";

type Props = {
  title: string;
  createdAt: string;
  countLabel: string;
  resourceTitle?: string;
  lastScore?: number | null;
  isDeleting: boolean;
  onOpen: () => void;
  onDelete: () => void; 
};

function formatRelativeCreatedAt(iso: string) {
  const created = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Created today";
  if (days === 1) return "Created 1 day ago";
  return `Created ${days} days ago`;
}

export default function QuizSetCard({
  title,
  createdAt,
  countLabel,
  resourceTitle,
  lastScore,
  isDeleting,
  onOpen,
  onDelete,
}: Props) {
  return (
    <div className="relative min-h-[170px] rounded-2xl bg-white shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-2xl p-6 text-left focus-visible:outline-none"
      >
        {resourceTitle ? (
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {resourceTitle}
          </div>
        ) : null}

        <div className="mt-2 text-sm font-bold text-[var(--color-primary)]">
          {title}
        </div>

        <div className="mt-4 inline-flex rounded-full bg-[var(--color-primary-muted)] px-4 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {countLabel}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
          <span>{formatRelativeCreatedAt(createdAt)}</span>
          {typeof lastScore === "number" ? (
            <span className="font-semibold text-[var(--color-primary)]">
              {lastScore}% last score
            </span>
          ) : null}
        </div>
      </button>

      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(); 
          }}
          disabled={isDeleting}
          aria-label="Delete quiz"
          title="Delete"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent p-0 text-gray-400 shadow-none transition hover:text-[var(--color-primary)] disabled:opacity-60"
        >
          <Trash2 size={18} className="pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
