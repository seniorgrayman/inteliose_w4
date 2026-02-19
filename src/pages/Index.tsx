import HeroSection from "@/components/HeroSection";
import ContextSection from "@/components/ContextSection";
import ModulesSection from "@/components/ModulesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="mx-auto max-w-7xl border-l border-r border-dashed border-border min-h-screen relative bg-background">
      {/* Vertical Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-4 opacity-20 z-0">
        <div className="w-px h-full bg-border" />
        <div className="w-px h-full bg-border" />
        <div className="w-px h-full bg-border" />
      </div>

      <main className="relative z-10 p-4 md:p-6 lg:p-8 space-y-6">
        <HeroSection />
        <ContextSection />
        <ModulesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <FooterSection />
      </main>
    </div>
  );
};

export default Index;
