import Button from "../Button";

type Props = {
  isOpen: boolean;
  isBusy: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDeleteQuizModal({
  isOpen,
  isBusy,
  onConfirm,
  onClose,
}: Props) {
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
          Are you sure you want <br /> to delete this quiz?
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
