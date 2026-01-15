import {Link} from "react-router-dom";
import logo from "../assets/landing/logo.svg";


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
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AI Study Hub" className="h-10 w-auto" draggable={false} />
            </Link>

      
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
          </div>
        </header>
      );      
}

export default Header;
