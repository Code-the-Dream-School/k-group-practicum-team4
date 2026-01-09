import Button from "../Button";

type Props = {
  onGenerate: () => void;
  isGenerating: boolean;
};

export default function FlashcardsEmptyState({ onGenerate, isGenerating }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
        ✨
      </div>

      <Button type="button" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating…" : "Generate Flashcards"}
      </Button>
    </div>
  );
}
