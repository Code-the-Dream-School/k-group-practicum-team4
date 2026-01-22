import SetGoalModal from "../../components/dashboard/SetGoalModal.tsx";
import React, { useState } from "react";

type WeeklyActivity = {
    flashcards: number;
    summaries: number;
    quizzes: number;
};

type TodayStats = {
    studiedMinutes: number;
    goalMinutes: number;
    flashcardsReviewed: number;
    quizzesCompleted: number;
};

type Props = {
    weekly: WeeklyActivity;
    today: TodayStats;
    setTodayStats: React.Dispatch<React.SetStateAction<TodayStats>>;
};

type WeeklyItem = {
    key: keyof WeeklyActivity;
    label: string;
    color: string;
    value: number;
    percent: number;
};


export default function StudyHighlights({ weekly, today, setTodayStats }: Props) {
    const weeklyTotal: number =
        weekly.flashcards + weekly.summaries + weekly.quizzes;

    const flashcardsPct: number =
        weeklyTotal > 0 ? (weekly.flashcards / weeklyTotal) * 100 : 0;

    const summariesPct: number =
        weeklyTotal > 0 ? (weekly.summaries / weeklyTotal) * 100 : 0;

    const quizzesPct: number =
        weeklyTotal > 0 ? (weekly.quizzes / weeklyTotal) * 100 : 0;

    const progressPercent: number =
        today.goalMinutes > 0
            ? Math.min((today.studiedMinutes / today.goalMinutes) * 100, 100)
            : 0;

    const weeklyItems: WeeklyItem[] = [
        { key: "flashcards", label: "Flashcards", color: "#6B53FF", value: weekly.flashcards, percent: flashcardsPct },
        { key: "summaries", label: "Summaries", color: "#9381FF", value: weekly.summaries, percent: summariesPct,},
        { key: "quizzes", label: "Quizzes", color: "#FFDD64", value: weekly.quizzes, percent: quizzesPct },
    ];

    const GAP = 0.6;
    const [isGoalOpen, setIsGoalOpen] = useState(false);


    return (
        <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-white p-8 shadow-[var(--shadow-card)]">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Study Highlights</h2>
                    <button
                        className="
                            text-xl font-semibold
                            pl-5
                            text-(--color-surface)
                            bg-black w-34 h-9.75
                            rounded-[19.5px]
                            cursor-pointer"

                        onClick={(): void => setIsGoalOpen(true)}
                    >
                        Set Goal
                    </button>
                    {isGoalOpen && (
                        <SetGoalModal
                            initialValue={today.goalMinutes}
                            onUpdateGoal={(minutes: number): void => {
                                setTodayStats((prev: TodayStats) => ({
                                    ...prev,
                                    goalMinutes: minutes,
                                }));
                            }}
                            onClose={(): void => setIsGoalOpen(false)}
                        />
                    )}

                </div>

                {/* Weekly Activity */}
                <div className="mb-8">
                    <div className="mb-4 text-base font-bold ">
                        Weekly Activity (last 7 days)
                    </div>

                    <div className="flex items-center gap-8">

                        {/* Ring */}
                        <div className="relative h-27 w-27">
                            {/* Gray base ring */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: "#f3f4f6",
                                    WebkitMask:
                                        "radial-gradient(circle, transparent 62%, black 63%)",
                                    mask:
                                        "radial-gradient(circle, transparent 62%, black 63%)",
                                }}
                            />

                            {/* Colored segments */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: ((): string => {
                                        const segments: string[] = [];
                                        let startPercent: number = 0;

                                        weeklyItems.forEach((item: WeeklyItem): void => {
                                            const endPercent: number = startPercent + item.percent;
                                            segments.push(`${item.color} ${startPercent}% ${endPercent - GAP}%`);
                                            segments.push(`transparent ${endPercent - GAP}% ${endPercent}%`);
                                            startPercent = endPercent;
                                        });

                                        return `conic-gradient(${segments.join(",")})`;
                                    })(),
                                    WebkitMask: "radial-gradient(circle, transparent 62%, black 63%)",
                                    mask: "radial-gradient(circle, transparent 62%, black 63%)",
                                }}
                            />
                        </div>

                        {/* Legend */}
                        <div className="space-y-4 text-sm">
                            {weeklyItems.map((item: WeeklyItem) => (
                                <div key={item.key} className="flex items-center gap-2">
                              <span
                                  className="h-5 w-5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                              />
                              <span>
                                 {Math.round(item.percent)}% {item.label}
                              </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Today */}
                <div>
                    <div className="mb-2 ml-4 text-base font-bold ">Today</div>

                    {/* Time Studied */}
                    <div className="mb-4 flex items-end gap-8">
                        {/* Left text */}
                        <div className="space-y-2 text-base">
                            Time Studied
                        </div>

                        {/* Progress block  */}
                        <div className="w-50">
                            {/* Min labels */}
                            <div className="mb-1 pr-4 pl-4 flex justify-between text-[10px] text-gray-400">
                                <span>{today.studiedMinutes} min</span>
                                <span>{today.goalMinutes} min</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-3 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-3 rounded-s-full bg-[var(--color-primary)]"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>


                    {/* Stats */}
                    <div className="space-y-2 text-base">
                        <div>Flashcards Reviewed {today.flashcardsReviewed} cards</div>
                        <div>Quizzes Completed {today.quizzesCompleted} quiz</div>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[var(--shadow-card)]">
                <p className="font-bold text-[18px]">Short study sessions improve retention</p>
            </div>
        </div>
    );
}
