import { useState } from "react";
import closeIcon from "../../assets/icons/CloseIcon.png";


type Props = {
    initialValue: number;
    onUpdateGoal: (minutes: number) => void;
    onClose: () => void;
};

export default function SetGoalModal({ initialValue, onUpdateGoal, onClose }: Props) {
    const [value, setValue] = useState<string>(
        initialValue ? String(initialValue) : ""
    );

    const isValid: boolean = Number(value) > 0;

    function handleSave(): void {
        if (!isValid) return;
        onUpdateGoal(Number(value));
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/68 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex flex-col justify-center relative z-10 w-169 max-w-[90%] h-88.75 max-h-[90%] rounded-2xl bg-white p-10  gap-3 shadow-lg">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-black hover:bg-gray-100 cursor-pointer"
                    aria-label="Close"
                >
                    <img src={closeIcon} alt="Close" className="h-6 w-6 object-contain"/>
                </button>

                {/* Title */}
                <h3 className="mb-2 text-4xl font-bold">
                    Set Your Daily Study Goal
                </h3>

                {/* Description */}
                <p className="mb-4 text-base text-gray-600">
                    How many minutes would you like to study each day?
                </p>

                {/* Input */}
                <input
                    type="number"
                    min={5}
                    step={5}
                    placeholder="Daily Goal (minutes)"
                    value={value}
                    onChange={(e): void => setValue(e.target.value)}
                    className="
                        mb-6 w-3/5 rounded-3xl border border-gray-200
                        px-5 py-3 text-sm
                        outline-none
                        focus:border-[var(--color-primary)]
                        focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!isValid}
                        className="
                            h-11.5 w-30
                            rounded-[20px]
                            bg-[var(--color-primary)]
                            text-base font-semibold text-white
                            disabled:opacity-50 disabled:cursor-not-allowed
                            cursor-pointer"
                    >
                        Save Goal
                    </button>

                    <button
                        onClick={onClose}
                        className="
                            h-11.5 w-24 rounded-[20px]
                            px-4 text-base font-semibold
                            text-[var(--color-primary)]
                            border border-[var(--color-primary)]
                            cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>

                {/* Helper text */}
                <p className="mt-4 text-xs text-gray-400">
                    * You can update this goal anytime.
                </p>
            </div>
        </div>
    );
}