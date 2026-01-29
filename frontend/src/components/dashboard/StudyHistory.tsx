// import { useNavigate } from "react-router-dom";
import documentStudyIcon from "../../assets/icons/DocumentStudyIcon.png"
import flashcardStudyIcon from "../../assets/icons/FlashcardStudyIcon.png"
import quizStudyIcon from "../../assets/icons/QuizStudyIcon.png"
import summaryStudyIcon from "../../assets/icons/SummaryStudyIcon.png"
// import { getActivityLog } from "../../api/apiClient.ts"



export type ActivityLogItem = {
    id: string;
    type: "resource_uploaded" | "summary_created" | "flashcards_created" | "quiz_created";
    resourceId: string;
    resourceTitle: string;
    createdAt: string;
};

type HistoryItem = {
    id: string;
    type: ActivityLogItem["type"];
    title: string;
    resourceTitle: string;
    subtitle: string;
    resourceId: string;
    icon: string;
};


type TabKey = "resource" | "summary" | "flashcards" | "quizzes";


const activityConfig = {
    resource_uploaded: {
        title: "Document Uploaded",
        icon: documentStudyIcon,
    },
    summary_created: {
        title: "Summary Created",
        icon: summaryStudyIcon,
    },
    flashcards_created: {
        title: "Flashcards Created",
        icon: flashcardStudyIcon,
    },
    quiz_created: {
        title: "Quiz Created",
        icon: quizStudyIcon,
    },
} as const;

const tabMap: Record<ActivityLogItem["type"], TabKey> = {
    resource_uploaded: "resource",
    summary_created: "summary",
    flashcards_created: "flashcards",
    quiz_created: "quizzes",
};



function mapActivityToHistory(item: ActivityLogItem): HistoryItem {
    const config = activityConfig[item.type];

    function pluralize(value: number, unit: string): string {
        return value === 1 ? unit : `${unit}s`;
    }

    function formatTimeAgo(date: string): string {
        const diff: number = Math.floor(
            (Date.now() - new Date(date).getTime()) / 1000
        );

        if (diff < 60) {
            const seconds: number = diff;
            return `${seconds} ${pluralize(seconds, "second")} ago`;
        }

        if (diff < 3600) {
            const minutes: number = Math.floor(diff / 60);
            return `${minutes} ${pluralize(minutes, "minute")} ago`;
        }

        if (diff < 86400) {
            const hours: number = Math.floor(diff / 3600);
            return `${hours} ${pluralize(hours, "hour")} ago`;
        }

        const days: number = Math.floor(diff / 86400);
        return `${days} ${pluralize(days, "day")} ago`;
    }

    return {
        id: item.id,
        type: item.type,
        title: config.title,
        resourceTitle: item.resourceTitle,
        subtitle: formatTimeAgo(item.createdAt),
        resourceId: item.resourceId,
        icon: config.icon,
    };
}

interface StudyHistoryProps {
    data: ActivityLogItem[];
}

export default function StudyHistory({ data }: StudyHistoryProps) {
    // const navigate = useNavigate();
    const items: HistoryItem[] = data.map(mapActivityToHistory);

    const handleClick = (item: HistoryItem): void => {
        if (!item.resourceId) {
            alert("No resourceId available!");
            return;
        }
        alert(`Navigate to resource: ${item.resourceId}\nTab: ${tabMap[item.type]}`);
    };

    /* Backend integration (when API is ready)

    const handleClick = (item: HistoryItem) => {
       if (!item.resourceId) return;
        navigate(`/resources/${item.resourceId}`, { state: { activeTab: tabMap[item.type] } });
    };

    const [apiData, setApiData] = useState<ActivityLogItem[]>([]);

    useEffect(() => {
      getActivityLog()
        .then(setApiData)
        .catch((err) => {
          console.error("Failed to load activity log", err);
        });
    }, []);

    const items = apiData.map(mapActivityToHistory);
   */

    return (
        <div className="rounded-2xl bg-white p-10 shadow-[var(--shadow-card)]">
            <h2 className="mb-6 text-xl font-bold">Study History</h2>
            <ul className="space-y-3">
                {items.map((item: HistoryItem) => (
                    <li
                        key={item.id}
                        className="
                            flex items-center justify-between
                             w-full max-w-[800px] min-h-[73px]
                             rounded-xl
                             border border-[var(--color-border-muted)]
                             px-4
                             cursor-pointer
                             transition-colors duration-200
                             hover:border-[#6B53FF]
"
                        onClick={(): void => handleClick(item)}
                    >
                        <div className="flex flex-row gap-6">
                            <img
                                src={item.icon}
                                alt=""
                                className="h-8 w-8 object-contain"
                            />
                            <div>
                                <div className="text-sm text-gray-900">
                                    <span className="font-bold">
                                        {item.title}
                                    </span>{" "}
                                    <span className="font-normal">
                                        {item.resourceTitle}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">{item.subtitle}</div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
