import StatCard from "../components/dashboard/StatCard";
import StudyHighlights from "../components/dashboard/StudyHighlights.tsx";
import StudyHistory from "../components/dashboard/StudyHistory";
import type { ActivityLogItem } from "../components/dashboard/StudyHistory";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import TopNav from "../components/TopNav";
import {
    getAuthUser,
    getActivityLog,
    getDashboardData,
} from "../api/apiClient";


type User = {
    firstName: string;
    lastName: string;
};

type DashboardStats = {
    documents: number;
    flashcards: number;
    quizzes: number;
};

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


export default function DashboardPage() {
    const authUser = getAuthUser();
    const displayName = authUser?.displayName?.trim() || "";
    const user = useMemo<User>(() => {
        if (!displayName) {
            return { firstName: "Student", lastName: "" };
        }
        const parts = displayName.split(" ").filter(Boolean);
        const firstName = parts[0] || "Student";
        return { firstName, lastName: "" };
    }, [displayName]);

    const [stats, setStats] = useState<DashboardStats>({
        documents: 0,
        flashcards: 0,
        quizzes: 0,
    });
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity>({
        flashcards: 0,
        summaries: 0,
        quizzes: 0,
    });
    const [todayStats, setTodayStats] = useState<TodayStats>({
        studiedMinutes: 0,
        goalMinutes: 60,
        flashcardsReviewed: 0,
        quizzesCompleted: 0,
    });
    const [activity, setActivity] = useState<ActivityLogItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;
        const loadDashboard = async (): Promise<void> => {
            try {
                const [dashboard, activityLog] = await Promise.all([
                    getDashboardData(),
                    getActivityLog(10),
                ]);
                if (!isActive) return;
                setStats({
                    documents: dashboard.stats.documentsCount,
                    flashcards: dashboard.stats.flashcardsCount,
                    quizzes: dashboard.stats.quizzesCount,
                });
                setWeeklyActivity(dashboard.weeklyActivity);
                setTodayStats((prev) => ({
                    ...prev,
                    studiedMinutes: dashboard.todayActivity.studiedMinutes,
                    flashcardsReviewed: dashboard.todayActivity.flashcardsReviewed,
                    quizzesCompleted: dashboard.todayActivity.quizzesCompleted,
                }));
                setActivity(activityLog);
            } catch (err: unknown) {
                if (!isActive) return;
                const message = err instanceof Error ? err.message : "Unable to load dashboard.";
                setError(message);
            }
        };

        loadDashboard();
        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <AppHeader />
            <TopNav />
            <main>
                <div className="mx-auto max-w-7xl">
                    <div className="pb-10 pt-10 flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black">
                                Hi, {user.firstName}
                            </h1>
                        </div>
                    </div>
                    {error && (
                        <div
                            className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                            aria-live="assertive"
                        >
                            {error}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard type="documents" value={stats.documents} />
                        <StatCard type="flashcards" value={stats.flashcards} />
                        <StatCard type="quizzes" value={stats.quizzes} />
                    </div>

                    {/* Bottom grid */}
                    <div className="grid gap-5 lg:grid-cols-3">
                        <StudyHighlights
                            weekly={weeklyActivity}
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

