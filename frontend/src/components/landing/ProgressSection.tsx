type ProgressSectionProps = {
    progressGirl: string;
    dashboardPreview: string;
  };
  
  function ProgressSection({ progressGirl, dashboardPreview }: ProgressSectionProps) {
    return (
      <section className="mt-24 grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h3 className="text-3xl font-black">Track your progress easily</h3>
          <p className="mt-3 max-w-md text-gray-600">See your dashboard, set goals, and study in short sessions.</p>
  
          <div className="mt-8">
            <img src={progressGirl} alt="Progress illustration" className="w-full max-w-[520px]" draggable={false} />
          </div>
        </div>
  
        <div className="flex justify-center md:justify-end">
          <div className="group w-full max-w-[520px]">
            <img
              src={dashboardPreview}
              alt="Dashboard preview"
              className="w-full rounded-[24px] shadow-[var(--shadow-card)] transition duration-300 will-change-transform md:group-hover:animate-[dashboard-wiggle_520ms_ease-in-out] md:group-hover:shadow-[var(--shadow-card-hover)]"
              draggable={false}
            />
          </div>
        </div>
      </section>
    );
  }
  
  export default ProgressSection;
  