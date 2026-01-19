import { useEffect, useMemo, useRef, useState } from "react";
import { SectionGlow } from "./LandingDecor";

type Step = {
  icon: string;
  step: string;
  title: string;
  subtitle: string;
};

type HowItWorksProps = {
  steps: Step[];
};

function HowItWorks({ steps }: HowItWorksProps) {
  const howRef = useRef<HTMLElement | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const el = howRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (hasPlayed) return;

        setHasPlayed(true);

        let step = 1;
        setActiveStep(step);

        const intervalMs = 900;
        const pauseAfterLastMs = 650;

        const id = window.setInterval(() => {
          step += 1;

          if (step <= 4) {
            setActiveStep(step);
            return;
          }

          window.clearInterval(id);
          window.setTimeout(() => setActiveStep(1), pauseAfterLastMs);
        }, intervalMs);
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasPlayed, isDesktop]);

  const progressPercent = useMemo(() => ((activeStep - 1) / 3) * 100, [activeStep]);

  return (
    <section ref={howRef} className="mt-20">
      <div className="relative">
        <SectionGlow />
        <div className="relative rounded-[28px] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
          <div className="px-6 py-10 md:px-10">
            <h2 className="text-center text-2xl font-black">How it Works</h2>

            <div className="mt-10">
              <div className="grid gap-6 md:grid-cols-4">
                {steps.map((s, idx) => {
                  const stepNumber = idx + 1;
                  const isActive = activeStep === stepNumber;

                  return (
                    <div
                      key={s.step}
                      className="flex flex-col items-center"
                      onMouseEnter={isDesktop ? () => setActiveStep(stepNumber) : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveStep(stepNumber)}
                        className={[
                          "group relative w-full max-w-[240px] rounded-[22px] px-6 py-7 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-0",
                          isActive ? "bg-white shadow-[0_18px_55px_rgba(0,0,0,0.10)]" : "bg-transparent",
                        ].join(" ")}
                      >
                        <div className="flex justify-center">
                          <img
                            src={s.icon}
                            alt=""
                            className={[
                              "object-contain transition duration-200",
                              "h-28 w-28 md:h-32 md:w-32",
                              isActive ? "opacity-100" : "opacity-60",
                            ].join(" ")}
                            draggable={false}
                          />
                        </div>

                        <div className="mt-5 text-center transition duration-200">
                          <div
                            className={[
                              "text-sm font-extrabold tracking-wide",
                              isActive ? "text-[var(--color-primary)]" : "text-gray-300",
                            ].join(" ")}
                          >
                            {s.step}
                          </div>

                          <div className="mt-2 text-sm font-bold text-gray-900">{s.title}</div>
                          <div className="text-sm text-gray-600">{s.subtitle}</div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <div className="relative mt-8">
                  <div className="h-[4px] w-full rounded-full bg-[var(--color-primary-muted)]" />

                  <div
                    className="absolute left-0 top-0 h-[4px] rounded-full bg-[var(--color-primary)] transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />

                  <div className="absolute left-0 top-1/2 w-full -translate-y-1/2">
                    <div className="grid grid-cols-4">
                      {[1, 2, 3, 4].map((n) => {
                        const filled = activeStep >= n;
                        const isCurrent = activeStep === n;

                        return (
                          <div key={n} className="flex justify-center">
                            <span
                              className={[
                                "h-4 w-4 rounded-full border-[4px] bg-white transition-colors duration-300",
                                filled ? "border-[var(--color-primary)]" : "border-[var(--color-primary-muted)]",
                                isCurrent ? "shadow-[0_0_0_7px_rgba(107,83,255,0.14)]" : "",
                              ].join(" ")}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
