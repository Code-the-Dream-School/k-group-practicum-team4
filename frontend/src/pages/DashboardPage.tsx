import StatCard from "../components/dashboard/StatCard";
import StudyHighlights from "../components/dashboard/StudyHighlights.tsx";
import StudyHistory from "../components/dashboard/StudyHistory";
import type { ActivityLogItem } from "../components/dashboard/StudyHistory";
import {useState} from "react";


type User = {
    firstName: string;
    lastName: string;
};

type DashboardStats = {
    documents: number;
    flashcards: number;
    quizzes: number;
};


// Mocks
const mockUser: User = { firstName: "Alena",  lastName: "Petrov"};

const mockStats: DashboardStats = {
    documents: 32,
    flashcards: 120,
    quizzes: 8,
};

const mockActivity: ActivityLogItem[] = [
    { id: "1", type: "resource_uploaded", resourceId: "res1", resourceTitle: "UX Principles", createdAt: "2026-01-16T07:00:00Z" },
    { id: "2", type: "flashcards_created", resourceId: "res2", resourceTitle: "React Basics", createdAt: "2026-01-15T13:00:00Z" },
    { id: "3", type: "quiz_created", resourceId: "res1", resourceTitle: "UX Principles", createdAt: "2026-01-14T23:00:00Z" },
    { id: "4", type: "resource_uploaded", resourceId: "res1", resourceTitle: "UX Principles", createdAt: "2026-01-14T17:00:00Z" },
    { id: "5", type: "summary_created", resourceId: "res2", resourceTitle: "React Basics", createdAt: "2026-01-13T17:00:00Z" },

];

const mockWeeklyActivity = {
    flashcards: 50,
    summaries: 25,
    quizzes: 25,
};


type TodayStats = {
    studiedMinutes: number;
    goalMinutes: number;
    flashcardsReviewed: number;
    quizzesCompleted: number;
};


export default function DashboardPage() {
    /**
     * Auth
     * TODO: replace mock user with real auth once backend is ready
     */
        // const { user } = useAuth();
        // if (!user) return null;
    const user = mockUser;

    /**
     * Dashboard stats
     * TODO: replace mock data with API call
     * Endpoint: GET /api/dashboard/stats
     * Expected response:
     * {
     *   documents: number;
     *   flashcards: number;
     *   quizzes: number;
     * }
     */
        // const { data: stats, isLoading, error } = useDashboardStats();

    const stats: DashboardStats = mockStats;


    // TEMP: will replace with:
    // const { data: activity } = useActivityLog();
    const activity: ActivityLogItem[] = mockActivity;


    const [todayStats, setTodayStats] = useState<TodayStats>({
        studiedMinutes: 25,
        goalMinutes: 60,
        flashcardsReviewed: 10,
        quizzesCompleted: 2,
    });

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <main>
                <div className="mx-auto max-w-7xl">
                    <div className="pb-10 pt-10 flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black">
                                Hi, {user.firstName} {user.lastName?.charAt(0)}.
                            </h1>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard type="documents" value={stats.documents} />
                        <StatCard type="flashcards" value={stats.flashcards} />
                        <StatCard type="quizzes" value={stats.quizzes} />
                    </div>

                    {/* Bottom grid */}
                    <div className="grid gap-5 lg:grid-cols-3">
                        <StudyHighlights
                            weekly={mockWeeklyActivity}
                            today={todayStats}
                            setTodayStats={setTodayStats}
                        />

                        <div className="lg:col-span-2">
                            <StudyHistory data={activity} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

