import { useMemo, useState } from "react";
import Button from "../Button";
import type { FlashcardSetDetailDto } from "../../api/flashcards";

type Props = {
  set: FlashcardSetDetailDto;
  onBack: () => void;
};

export default function FlashcardPlayer({ set, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = set.cards.length;

  const safeIndex = useMemo(() => {
    if (total === 0) return 0;
    return Math.min(index, total - 1);
  }, [index, total]);

  const card = set.cards[safeIndex];

  function prev() {
    setIndex((v) => Math.max(0, v - 1));
    setIsFlipped(false);
  }

  function next() {
    setIndex((v) => Math.min(total - 1, v + 1));
    setIsFlipped(false);
  }

  function roundIconButtonClasses(disabled?: boolean) {
    return [
      "h-10 w-10 rounded-full bg-white shadow-[var(--shadow-card)]",
      "flex items-center justify-center",
      "border border-[var(--color-border-muted)]",
      "text-[var(--color-text)]",
      "transition",
      "hover:-translate-y-[1px]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
      disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to all flashcards sets
      </button>

      {total === 0 ? (
        <div className="py-10 text-sm text-gray-500">No cards in this set.</div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-6 text-sm text-gray-700">
            {safeIndex + 1}/{total}
          </div>

          <div className="w-full max-w-[560px]" style={{ perspective: 1200 }}>
            <button
              type="button"
              onClick={() => setIsFlipped((v) => !v)}
              className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-2xl"
              aria-label="Flip card"
            >
              <div
                className="relative h-[260px] w-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl bg-[var(--color-primary)] text-white shadow-[var(--shadow-card)] flex items-center justify-center px-10 text-center text-lg font-semibold"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="max-h-[200px] w-full overflow-y-auto pr-2 break-words">
                    {card.front}
                  </div>
                </div>

                <div
                  className="absolute inset-0 rounded-2xl bg-white text-[var(--color-text)] shadow-[var(--shadow-card)] flex items-center justify-center px-10 text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="w-full">
                    <div className="max-h-[160px] overflow-y-auto pr-2 text-base font-medium leading-relaxed break-words">
                      {card.back}
                    </div>

                    {card.explanation ? (
                      <div className="mx-auto mt-8 max-w-[420px] text-xs leading-relaxed text-gray-500">
                        <span className="font-semibold text-gray-500">Explanation:</span>{" "}
                        {card.explanation}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={safeIndex === 0}
              className={roundIconButtonClasses(safeIndex === 0)}
              aria-label="Previous card"
              title="Previous"
            >
              ‹
            </button>

            <Button type="button" onClick={() => setIsFlipped((v) => !v)}>
              ↻ Flip card
            </Button>

            <button
              type="button"
              onClick={next}
              disabled={safeIndex === total - 1}
              className={roundIconButtonClasses(safeIndex === total - 1)}
              aria-label="Next card"
              title="Next"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
