import type {ButtonHTMLAttributes, PropsWithChildren} from "react";

type ButtonVariant = "primary" | "outline";

type ButtonProps = PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: ButtonVariant;
        fullWidth?: boolean;
    }
>;

function Button({children, className = "", variant = "primary", fullWidth, ...rest}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center rounded-full px-6 py-[10px] text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0";
    const variantClasses =
        variant === "outline"
            ? "border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:-translate-y-[1px] focus-visible:ring-[var(--color-accent)]"
            : "bg-[var(--color-primary)] text-white shadow-[var(--shadow-strong)] hover:translate-y-[-1px] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]";
    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button className={[baseClasses, variantClasses, widthClass, className].filter(Boolean).join(" ")} {...rest}>
            {children}
        </button>
    );
}

export default Button;
