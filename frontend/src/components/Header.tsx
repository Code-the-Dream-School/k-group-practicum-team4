import {Link} from "react-router-dom";

type HeaderProps = {
    primaryCtaPath?: string;
    primaryCtaLabel?: string;
    secondaryCtaPath?: string;
    secondaryCtaLabel?: string;
};

function Header({
    primaryCtaPath = "/signup",
    primaryCtaLabel = "Sign up",
    secondaryCtaPath = "/signin",
    secondaryCtaLabel = "Sign in",
}: HeaderProps) {
    return (
        <header className="bg-[var(--color-primary)] text-white shadow-lg">
            <div className="flex w-full items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-sm bg-[var(--color-accent)] shadow-[0_10px_24px_rgba(0,0,0,0.2)]" />
                    <div className="leading-tight">
                        <div className="text-lg font-extrabold uppercase tracking-wide">Logotype</div>
                        <div className="text-[11px] text-white/80">Brand Descriptor</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to={secondaryCtaPath}
                        className="rounded-full border border-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-accent)] transition duration-200 hover:bg-[var(--color-accent-soft)] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0"
                    >
                        {secondaryCtaLabel}
                    </Link>
                    <Link
                        to={primaryCtaPath}
                        className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-accent-ink)] shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[var(--color-accent-hover)] hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0"
                    >
                        {primaryCtaLabel}
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
