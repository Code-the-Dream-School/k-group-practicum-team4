import docIcon from "../../assets/icons/DocStatIcon.png";
import flashcardsIcon from "../../assets/icons/FlashStatIcon.png";
import quizzesIcon from "../../assets/icons/QuizzesStatIcon.png";


interface StatCardProps {
    type: "documents" | "flashcards" | "quizzes";
    value: number;
}


export default function StatCard({ type, value }: StatCardProps) {
    const titleMap = {
        documents: "Documents",
        flashcards: "Flashcards",
        quizzes: "Quizzes",
    };

    const colorMap = {
        documents: "bg-[var(--color-primary)] text-white",
        flashcards: "bg-[var(--color-primary-hover)] text-white",
        quizzes: "bg-[var(--color-surface)] text-black",
    };

    const iconMap = {
        documents: docIcon,
        flashcards: flashcardsIcon,
        quizzes: quizzesIcon,
    };


    return (
        <div
            className={`w-[419px] h-[132px] rounded-xl shadow ${colorMap[type]} flex items-center justify-between px-6`}
        >
            {/*Left-side - Value */}
            <div className="flex flex-row items-baseline gap-2">
                <div className="font-bold text-[64px]">{value}</div>
                <div className="font-bold text-[20px]">{titleMap[type]}</div>
            </div>

            {/* Right-side - Icon */}
            <img
                src={iconMap[type]}
                alt={titleMap[type]}
                className="w-[122px] h-[120px] object-contain"
            />
        </div>
    );
}
