import HeroSection from "@/components/HeroSection";
import ContractAddressSection from "@/components/ContractAddressSection";
import ContextSection from "@/components/ContextSection";
import TechnologySection from "@/components/TechnologySection";
import ModulesSection from "@/components/ModulesSection";
import HowItWorksSection from "@/components/HowItWorksSection";

import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="mx-auto max-w-7xl border-l border-r border-dashed border-border min-h-screen relative bg-secondary/50">
      {/* Vertical Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-4 opacity-20 z-0">
        <div className="w-px h-full bg-border" />
        <div className="w-px h-full bg-border" />
        <div className="w-px h-full bg-border" />
      </div>

      <main className="relative z-10 p-3 md:p-6 lg:p-8 space-y-6">
        <HeroSection />
        <ContractAddressSection />
        <ContextSection />
        <TechnologySection />
        <ModulesSection />
        <HowItWorksSection />
        
        <FAQSection />
        <FooterSection />
      </main>
    </div>
  );
};

export default Index;
