import { Link, useLocation } from "react-router-dom";
import { BookOpen, HelpCircle, Home, IdCard } from "lucide-react";

type NavItem = {
  label: string;
  path: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Study Room",
    path: "/library",
    icon: BookOpen,
    isActive: (pathname) =>
      pathname.startsWith("/library") || pathname.startsWith("/resources"),
  },
  {
    label: "Flashcards",
    path: "/flashcards",
    icon: IdCard,
    isActive: (pathname) => pathname.startsWith("/flashcards"),
  },
  {
    label: "Quizzes",
    path: "/quizzes",
    icon: HelpCircle,
    isActive: (pathname) =>
      pathname.startsWith("/quizzes") || pathname.startsWith("/quiz"),
  },
];

export default function TopNav() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4 text-sm font-semibold text-slate-600">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive(pathname);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition ${
                isActive
                  ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-strong)]"
                  : "hover:text-[var(--color-primary-strong)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
