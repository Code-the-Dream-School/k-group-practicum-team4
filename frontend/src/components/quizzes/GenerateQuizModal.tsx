import { useEffect, useState } from "react";
import Button from "../Button";
import Input from "../Input";

type Props = {
  isOpen: boolean;
  isGenerating: boolean;
  onGenerate: (questionCount: number) => void;
  onClose: () => void;
};

export default function GenerateQuizModal({
  isOpen,
  isGenerating,
  onGenerate,
  onClose,
}: Props) {
  const [value, setValue] = useState("10");

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const count = Number(value);
  const isValid = Number.isInteger(count) && count >= 5 && count <= 10;

  function handleGenerate() {
    if (!isValid) return;
    onGenerate(count);
  }

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
            Generate New Quiz
            </h3>

            <div className="mt-6 max-w-[360px]">
            <div className="mb-2 text-sm font-semibold text-gray-700">
                Number of questions
            </div>

            <Input
                placeholder="Enter the number of questions"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            <div className="mt-2 text-xs text-gray-500">
                Choose between 5 and 10 questions
            </div>
            </div>


        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
          >
            {isGenerating ? "Generating…" : "Generate"}
          </Button>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="h-11 rounded-full border border-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-90 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
