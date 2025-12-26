import type {PropsWithChildren} from "react";

type CardProps = PropsWithChildren<{
    className?: string;
}>;

function Card({children, className = ""}: CardProps) {
    const containerClasses =
        "w-full max-w-xl rounded-[20px] border border-[var(--color-surface-border)] bg-[var(--color-surface-veil)] backdrop-blur-xl shadow-[var(--shadow-card)] transition duration-300 hover:shadow-[var(--shadow-card-hover)] animate-fade-slide";

    return (
        <div className={[containerClasses, className].filter(Boolean).join(" ")}>
            <div className="px-9 py-10">{children}</div>
        </div>
    );
}

export default Card;
