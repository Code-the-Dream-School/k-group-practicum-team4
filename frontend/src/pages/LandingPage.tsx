import Header from "../components/Header";

import heroBoy from "../assets/landing/hero-boy.png";
import step1 from "../assets/landing/step-1-upload.png";
import step2 from "../assets/landing/step-2-summary.png";
import step3 from "../assets/landing/step-3-flashcards.png";
import step4 from "../assets/landing/step-4-short-sessions.png";
import progressGirl from "../assets/landing/progress-girl.png";
import dashboardPreview from "../assets/landing/dashboard-preview.png";

import LandingHero from "../components/landing/LandingHero";
import HowItWorks from "../components/landing/HowItWorks";
import ProgressSection from "../components/landing/ProgressSection";
import LandingFooter from "../components/landing/LandingFooter";
import { BackgroundSparkles, LandingAnimations } from "../components/landing/LandingDecor";

const steps = [
  { icon: step1, step: "STEP 1", title: "Add resource", subtitle: "Upload a document" },
  { icon: step2, step: "STEP 2", title: "Let AI create", subtitle: "a brief overview" },
  { icon: step3, step: "STEP 3", title: "Generate study", subtitle: "flashcards or quiz" },
  { icon: step4, step: "STEP 4", title: "Study", subtitle: "short sessions" },
];

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <BackgroundSparkles />
      <Header />

      <main className="relative z-10 px-6">
        <div className="mx-auto max-w-6xl py-14">
          <LandingHero heroImage={heroBoy} />
          <HowItWorks steps={steps} />
          <ProgressSection progressGirl={progressGirl} dashboardPreview={dashboardPreview} />
        </div>
      </main>

      <LandingFooter />
      <LandingAnimations />
    </div>
  );
}

export default LandingPage;
