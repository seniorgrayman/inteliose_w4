import { ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Using a public example image URL – replace with your own if needed
  const bgImageUrl =
    "https://www.shutterstock.com/image-illustration/base-logo-coins-metallic-effects-600nw-2518016629.jpg";

  return (
    <section
      id="hero"
      className={`
        relative w-full rounded-3xl md:rounded-4xl overflow-hidden
        bg-surface-dark text-surface-dark-foreground
        min-h-[500px] md:min-h-[600px]
        flex flex-col justify-between
        p-5 md:p-8 lg:p-12 shadow-2xl
      `}
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        // Mobile (default): repeat + original size
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "auto",
      }}
    >
      {/* Responsive override: on md+ → no repeat, cover, centered */}
      <div
        className="
          absolute inset-0 bg-cover bg-center bg-no-repeat
          md:bg-[image:var(--tw-bg-image)] /* forces style to apply again */
        "
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      />

      {/* Overlay – adjust opacity/color as needed for readability */}
      <div className="absolute inset-0 bg-black/40 md:bg-black/30" />

      {/* Or your original gradient overlay – uncomment if preferred */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" /> */}

      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 mt-auto max-w-4xl">
        <h1 className="text-3xl font-bold mt-20 sm:text-4xl md:text-6xl leading-[1.1] mb-6 md:mb-8 font-display font-medium tracking-tighter text-white">
          Build Smarter Tokens. <br />
          <span className="text-primary text-white/70 font-bold text-2xl md:text-3xl">
            Avoid Predictable Failure.
          </span>{" "}
          <br />
        </h1>
        <p className="text-base font-bold md:text-lg text-white max-w-2xl mb-2 md:mb-8">
          Web4 enabled intelligence to optimize your token strategy on base chain.
        </p>

        <p className="text-base text-sm md:text-lg text-white/90 max-w-2xl">
          Inteliose is a founder and traders centric intelligence platform
          leveraging web4 on base chain. We analyze your token, classify risk
          baselines, and surface failure modes before they burn your project.
        </p>

        <div className="flex mt-14">
          <div className="flex flex-wrap gap-3 justify-start">
            <Link
              to="/dashboard"
              className="
                group inline-flex items-center gap-2 
                bg-white text-black/80
                px-8 py-3.5 rounded-[35px] text-sm font-display font-semibold 
                transition-all 
                shadow-[0_6px_25px_hsl(var(--primary)/0.3),0_1px_0_0_hsl(0_0%_100%/0.15)_inset]
                hover:scale-103 hover:shadow-[0_12px_40px_hsl(240_100%_50%/_0.25)]
              "
            >
              Launch DYOR Engine
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              to="/manage-project"
              className="
                inline-flex items-center gap-2 
                bg-white 
                border border-[hsl(var(--border)/0.5)] text-foreground 
                px-8 py-3.5 rounded-[35px] text-sm font-display font-medium 
                hover:border-primary/30 transition-all 
                shadow-[0_1px_0_0_hsl(0_0%_100%/0.4)_inset,0_2px_6px_-2px_hsl(0_0%_0%/0.06)]
              "
            >
              Manage Project
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;