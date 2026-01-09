type TabsProps = {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  labelMap?: Record<string, string>;
};

function Tabs({ tabs, activeTab, onChange, labelMap }: TabsProps) {
  return (
    // Single white tray — no shadow, no border, no glow
    <div className="w-full rounded-2xl bg-white px-8 py-3 border border-[#ECEAFE] shadow-[0_8px_24px_rgba(99,91,255,0.10)]">

      <div className="flex flex-wrap items-center gap-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={[
                "rounded-full px-6 py-2.5 text-sm font-semibold transition",
                "focus-visible:outline-none",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              {labelMap?.[tab] ?? tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
