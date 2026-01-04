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

export default function FlashcardSetsPage({
  sets,
  countsBySetId,
  isGenerating,
  deletingId,
  onGenerate,
  onOpenSet,
  onDeleteSet,
}: Props) {
  return (
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
              onDelete={() => onDeleteSet(set.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
