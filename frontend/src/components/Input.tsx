import {forwardRef} from "react";
import type {InputHTMLAttributes} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function InputBase({className = "", ...rest}, ref) {
    const baseClasses =
        "w-full rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] outline-none ring-[var(--color-primary)] transition focus:ring-2";

    return <input ref={ref} className={[baseClasses, className].filter(Boolean).join(" ")} {...rest} />;
});

export default Input;
