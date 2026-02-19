import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is inteliose for investors?",
    a: "No. It's built for founders and operators who want to build sustainable projects, not just speculate.",
  },
  {
    q: "Does this replace token analytics tools?",
    a: 'No. We don\'t replace dashboards. We interpret risk. We provide the "so what?" behind the data.',
  },
  {
    q: "Is it Base-only?",
    a: "Currently Base-native. We focus on where serious builders are migrating. Expansion roadmap coming.",
  },
  {
    q: "Is dev wallet tracking mandatory?",
    a: "No. It's optional and founder-controlled. You decide what intelligence modules to activate.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm text-muted-foreground mb-2 block">/ Support</span>
          <h2 className="text-3xl text-foreground font-display font-medium tracking-tighter">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {faqs.map((faq) => (
            <div key={faq.q} className="group">
              <h3 className="text-lg text-foreground mb-2 flex items-center gap-2">
                <span className="bg-secondary rounded-lg p-1 group-hover:bg-border transition-colors">
                  <Plus className="text-muted-foreground" size={14} />
                </span>
                {faq.q}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed pl-8">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
