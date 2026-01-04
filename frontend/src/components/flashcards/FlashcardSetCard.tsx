// FlashcardSetCard.tsx
import { Trash2 } from "lucide-react";

type Props = {
  title: string;
  createdAt: string;
  countLabel: string;
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

export default function FlashcardSetCard({
  title,
  createdAt,
  countLabel,
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
        <div className="text-sm font-bold text-[var(--color-primary)]">{title}</div>

        {/* Lighter badge (not like primary button) */}
        <div className="mt-4 inline-flex rounded-full bg-[var(--color-primary-muted)] px-4 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {countLabel}
        </div>

        <div className="mt-6 text-xs text-gray-500">{formatRelativeCreatedAt(createdAt)}</div>
      </button>

      {/* Delete icon: always visible, grey -> purple on hover, no background */}
      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // prevents triggering onOpen
            onDelete();
          }}
          disabled={isDeleting}
          aria-label="Delete set"
          title="Delete"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent p-0 text-gray-400 shadow-none transition hover:text-[var(--color-primary)] disabled:opacity-60"
        >
          <Trash2 size={18} className="pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
