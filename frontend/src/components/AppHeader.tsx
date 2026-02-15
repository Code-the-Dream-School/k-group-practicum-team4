import { Link, useNavigate } from "react-router-dom";
import { LogOut, Search, Sparkles } from "lucide-react";
import { avatars } from "../data/avatars";
import { clearAuthToken, clearAuthUser, getAuthUser } from "../api/apiClient";
import logo from "../assets/landing/logo.svg";

type AppHeaderProps = {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export default function AppHeader({
  showSearch = true,
  searchValue = "",
  onSearchChange,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const displayName =
    authUser?.displayName?.trim() ||
    authUser?.displayName ||
    "User";
  const displayLabel = (() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]?.toUpperCase()}`;
    }
    return displayName;
  })();
  const avatarSrc = authUser?.avatarId
    ? avatars.find((avatar) => avatar.id === authUser.avatarId)?.src
    : null;

  const handleLogout = () => {
    clearAuthToken();
    clearAuthUser();
    navigate("/signin");
  };
  const isSearchInteractive = typeof onSearchChange === "function";

  return (
    <header className="bg-[var(--color-primary)] text-white shadow-lg">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="AI Study Hub"
              className="h-10 w-auto"
              draggable={false}
            />
          </Link>

          {showSearch ? (
            <div className="flex min-w-[240px] flex-1 items-center justify-center">
              <label className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                {isSearchInteractive ? (
                  <input
                    type="search"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="w-full rounded-full border border-white/20 bg-white/15 px-11 py-3 text-sm text-white placeholder:text-white/70 focus:border-white/50 focus:outline-none"
                  />
                ) : (
                  <input
                    type="search"
                    placeholder="Search"
                    defaultValue={searchValue}
                    className="w-full rounded-full border border-white/20 bg-white/15 px-11 py-3 text-sm text-white placeholder:text-white/70 focus:border-white/50 focus:outline-none"
                  />
                )}
              </label>
            </div>
          ) : (
            <div className="flex min-w-[240px] flex-1" />
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15 text-base font-semibold">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </span>
              <div className="font-semibold">{displayLabel}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
            >
              Logout
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
