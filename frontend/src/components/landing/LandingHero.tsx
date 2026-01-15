import { Link } from "react-router-dom";
import Button from "../Button";
import { Sparkles } from "./LandingDecor";

type LandingHeroProps = {
  heroImage: string;
};

function LandingHero({ heroImage }: LandingHeroProps) {
  return (
    <div className="grid items-center gap-12 md:grid-cols-2">
      <div>
        <h1 className="text-5xl font-black uppercase tracking-tight text-[var(--color-primary)] md:text-6xl">
          Upload. Generate.
          <br />
          Learn.
        </h1>

        <p className="mt-5 max-w-md text-base text-gray-700">
          Upload a resource and let AI create everything
          <br />
          you need to study.
        </p>

        <div className="mt-7">
          <Link to="/signup">
            <Button className="px-7">LET&apos;S ADD SOME MAGIC ✨</Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center md:justify-end">
        <div className="relative w-full max-w-[520px]">
          <Sparkles variant="hero" />
          <img src={heroImage} alt="Student learning with AI" className="relative z-10 w-full" draggable={false} />
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
