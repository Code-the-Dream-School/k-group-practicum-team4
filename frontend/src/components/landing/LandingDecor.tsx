type SparkleVariant = "hero" | "soft";

type Sparkle = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  delay: number;
  twinkle: number;
  float: number;
  opacity: number;
};

const heroSparkles: Sparkle[] = [
  { top: "6%", left: "18%", size: 22, delay: 0.0, twinkle: 1.9, float: 3.3, opacity: 1 },
  { top: "10%", right: "12%", size: 18, delay: 0.3, twinkle: 2.1, float: 3.6, opacity: 0.95 },
  { top: "18%", left: "6%", size: 16, delay: 0.6, twinkle: 2.2, float: 3.8, opacity: 0.85 },
  { top: "30%", right: "4%", size: 24, delay: 0.2, twinkle: 2.0, float: 4.0, opacity: 1 },
  { top: "44%", right: "14%", size: 18, delay: 0.5, twinkle: 2.4, float: 3.5, opacity: 0.9 },
  { top: "52%", right: "0%", size: 20, delay: 0.1, twinkle: 2.3, float: 3.9, opacity: 0.95 },
  { bottom: "28%", right: "8%", size: 22, delay: 0.4, twinkle: 2.2, float: 3.6, opacity: 1 },
  { bottom: "18%", left: "14%", size: 18, delay: 0.7, twinkle: 2.5, float: 3.7, opacity: 0.9 },
  { bottom: "10%", right: "22%", size: 16, delay: 0.2, twinkle: 2.1, float: 3.4, opacity: 0.85 },
];

const softSparkles: Sparkle[] = [
  { top: "8%", left: "8%", size: 14, delay: 0.1, twinkle: 2.4, float: 3.6, opacity: 0.55 },
  { top: "18%", right: "10%", size: 12, delay: 0.5, twinkle: 2.7, float: 4.2, opacity: 0.5 },
  { top: "40%", left: "2%", size: 16, delay: 0.2, twinkle: 2.5, float: 4.0, opacity: 0.55 },
  { bottom: "22%", right: "6%", size: 14, delay: 0.7, twinkle: 2.8, float: 4.4, opacity: 0.5 },
  { bottom: "10%", left: "18%", size: 12, delay: 0.3, twinkle: 2.6, float: 4.1, opacity: 0.5 },
];

export function Sparkles({ variant = "hero" }: { variant?: SparkleVariant }) {
  const layout = variant === "hero" ? heroSparkles : softSparkles;
  const dotCount = variant === "hero" ? 10 : 6;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {layout.map((s, i) => (
        <span
          key={`sparkle-${variant}-${i}`}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            filter:
              variant === "hero"
                ? "drop-shadow(0 14px 28px rgba(107,83,255,0.22))"
                : "drop-shadow(0 10px 20px rgba(107,83,255,0.14))",
            animation: `sparkle-twinkle ${s.twinkle}s ease-in-out ${s.delay}s infinite, sparkle-float ${s.float}s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <SparkleIcon />
        </span>
      ))}

      {Array.from({ length: dotCount }).map((_, i) => (
        <span
          key={`dot-${variant}-${i}`}
          className="absolute rounded-full"
          style={{
            width: (variant === "hero" ? 4 : 3) + (i % 3),
            height: (variant === "hero" ? 4 : 3) + (i % 3),
            top: `${12 + (i * 11) % 76}%`,
            left: `${(variant === "hero" ? 55 : 20) + (i * 13) % 55}%`,
            background: variant === "hero" ? "rgba(253, 208, 100, 0.55)" : "rgba(253, 208, 100, 0.28)",
            boxShadow:
              variant === "hero"
                ? "0 10px 26px rgba(107,83,255,0.18)"
                : "0 10px 22px rgba(107,83,255,0.10)",
            animation: `sparkle-twinkle ${2.2 + (i % 3) * 0.35}s ease-in-out ${i * 0.12}s infinite, sparkle-float ${
              3.4 + (i % 4) * 0.25
            }s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path
        d="M12 2l1.4 6.1L20 10l-6.6 1.9L12 18l-1.4-6.1L4 10l6.6-1.9L12 2z"
        fill="var(--color-accent)"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function BackgroundSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <span
        className="absolute -top-24 left-[-80px] h-[360px] w-[360px] rounded-full"
        style={{ background: "rgba(253, 208, 100, 0.18)", filter: "blur(30px)" }}
      />
      <span
        className="absolute bottom-[-160px] left-[20%] h-[460px] w-[460px] rounded-full"
        style={{ background: "rgba(253, 208, 100, 0.12)", filter: "blur(40px)" }}
      />
    </div>
  );
}

export function SectionGlow() {
  return (
    <>
      <span
        className="pointer-events-none absolute -top-10 left-12 hidden h-[220px] w-[220px] rounded-full md:block"
        style={{ background: "rgba(253, 208, 100, 0.14)", filter: "blur(26px)" }}
      />
      <span
        className="pointer-events-none absolute -bottom-10 right-16 hidden h-[260px] w-[260px] rounded-full md:block"
        style={{ background: "rgba(107, 83, 255, 0.14)", filter: "blur(30px)" }}
      />
    </>
  );
}

export function LandingAnimations() {
  return (
    <style>{`
      @keyframes sparkle-twinkle {
        0%, 100% { transform: scale(0.95); opacity: 0.65; }
        50% { transform: scale(1.25); opacity: 1; }
      }
      @keyframes sparkle-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `}</style>
  );
}
