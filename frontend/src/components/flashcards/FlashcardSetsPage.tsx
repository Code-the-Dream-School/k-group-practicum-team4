import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import FlashcardSetCard from "./FlashcardSetCard";
import type { FlashcardSetListItemDto } from "../../api/flashcards";

type Props = {
  sets: FlashcardSetListItemDto[];
  countsBySetId: Record<string, number>;
  isGenerating: boolean;
  deletingId: string | null;
  onGenerate: () => void;
  onOpenSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
};

type ConfirmState = {
  isOpen: boolean;
  setId: string | null;
};

function ConfirmDeleteModal(props: {
  isOpen: boolean;
  isBusy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { isOpen, isBusy, onConfirm, onClose } = props;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-[var(--shadow-card)]">
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:text-gray-800"
        >
          ×
        </button>

        <h3 className="text-3xl font-black leading-tight">
          Are you sure you want <br /> to delete this flashcard set?
        </h3>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button type="button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Deleting…" : "Yes, Delete"}
          </Button>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="h-11 rounded-full border border-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-90 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardSetsPage({
  sets,
  countsBySetId,
  isGenerating,
  deletingId,
  onGenerate,
  onOpenSet,
  onDeleteSet,
}: Props) {
  const [confirm, setConfirm] = useState<ConfirmState>({ isOpen: false, setId: null });

  const isModalBusy = useMemo(() => {
    if (!confirm.isOpen || !confirm.setId) return false;
    return deletingId === confirm.setId;
  }, [confirm.isOpen, confirm.setId, deletingId]);

  useEffect(() => {
    // If deletion finished, close modal automatically
    if (confirm.isOpen && confirm.setId && deletingId === null) {
      // Do nothing here because deletingId could be null also initially.
      // We'll close only when the set disappears OR you can close on success in parent.
    }
  }, [confirm.isOpen, confirm.setId, deletingId]);

  const openConfirm = (setId: string) => {
    setConfirm({ isOpen: true, setId });
  };

  const closeConfirm = () => {
    if (isModalBusy) return;
    setConfirm({ isOpen: false, setId: null });
  };

  const confirmDelete = () => {
    if (!confirm.setId) return;
    onDeleteSet(confirm.setId);
  };

  return (
    <>
      <ConfirmDeleteModal
        isOpen={confirm.isOpen}
        isBusy={isModalBusy}
        onConfirm={confirmDelete}
        onClose={closeConfirm}
      />

      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-black">My Flashcards sets</h2>
          <Button type="button" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating…" : "Generate New set"}
          </Button>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => {
            const count = countsBySetId[set.id];
            const countLabel = typeof count === "number" ? `${count} Flashcards` : "Loading…";

            return (
              <FlashcardSetCard
                key={set.id}
                title={set.title}
                createdAt={set.createdAt}
                countLabel={countLabel}
                isDeleting={deletingId === set.id}
                onOpen={() => onOpenSet(set.id)}
                onDelete={() => openConfirm(set.id)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
