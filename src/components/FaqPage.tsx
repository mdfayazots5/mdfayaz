import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, HelpCircle, Code2, Users, Calendar, Sparkles } from "lucide-react";
import { FaqItem } from "../models/portfolio.model";
import { getFaqItems } from "../services/api";
import { LoadingScreen } from "./LoadingScreen";

interface FAQItem {
  q: string;
  a: string;
  category: "Architectural" | "Recruitment" | "Consulting";
}

const FAQS: FAQItem[] = [
  {
    q: "What is your primary software architectural style?",
    a: "I advocate for Clean Architecture with Domain-Driven Design (DDD) principles. This involves separating the databases, domain models, business handlers, and web controllers into distinct project libraries, dramatically reducing coupling and supporting parallel developer sprints.",
    category: "Architectural"
  },
  {
    q: "How do you ensure .NET API performance under massive volume?",
    a: "I prioritize database index tuning, eager loading prevention (via EF Core Select mappings), caching mechanisms using memory or Redis, and asynchronous request handling. In SQL Server, I profile dense queries via execution plan analyzer tools to find high CPU/IO costs.",
    category: "Consulting"
  },
  {
    q: "What is your transition, onboarding, or recruitment notice period?",
    a: "I am ready for immediate deployment and can initiate team standups or legacy code transitions within 0 to 15 days of contract alignment or hiring confirmation.",
    category: "Recruitment"
  },
  {
    q: "Do you have working experience with agile teams?",
    a: "Yes. I have actively led a 5-developer agile team in delivering critical SaaS module pipelines, establishing clear repository guidelines, leading daily standups, and resolving code integration bottlenecks.",
    category: "Recruitment"
  },
  {
    q: "Are you open to hybrid, onsite, or remote schedules?",
    a: "Currently, I am based in Hyderabad, India, with a highly optimized, dual-monitor, 500Mbps remote home office. I am open to hybrid schedules inside Hyderabad, as well as fully remote roles worldwide overlapping Western, European, or APAC schedules.",
    category: "Recruitment"
  },
  {
    q: "What is your experience with database migrations or relational modelling?",
    a: "I have years of experience with Microsoft SQL Server, PostgreSQL, and Entity Framework Core migrations. I focus on safe migrations, schema normalization, custom index structures, and high-integrity stored procedures.",
    category: "Architectural"
  },
  {
    q: "Can you consult on legacy code modernizations?",
    a: "Yes. I help organizations decouple legacy monoblocks into clean microservices, transition old .NET Framework platforms into ASP.NET Core 8+, optimize database performance bottlenecks, and introduce testable layered architectures.",
    category: "Consulting"
  }
];

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    getFaqItems()
      .then((items) => {
        if (isMounted) {
          setFaqs(items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredFaqs = faqs.filter((faq) => {
    const qText = (faq.question || "").toLowerCase();
    const aText = (faq.answer || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = qText.includes(query) || aText.includes(query);
    const matchesCategory = filterCategory === "all" ? true : faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Architectural", "Recruitment", "Consulting"];

  return (
    <div id="faq-page-container" className="pt-24 lg:pt-36 bg-background select-none text-text-primary text-left">
      {/* Header element */}
      <header className="px-5 md:px-8 lg:px-24 py-16 text-center border-b border-border relative overflow-hidden bg-surface/40">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-[30vw] font-luxury font-black text-text-secondary select-none">Q&A</span>
        </div>
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.5em] block">
            COMMON INQUIRIES & RESOLUTIONS
          </span>
          <h1 className="text-4xl lg:text-6xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
            Architect & Recruiter FAQ
          </h1>
          <p className="text-sm text-text-secondary font-medium max-w-xl mx-auto leading-relaxed">
            Quick, objective responses surrounding software design, database optimizations, contract咨询, notice frameworks, and hybrid agile operations.
          </p>
        </div>
      </header>

      {/* Main core FAQ dynamic interface */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 lg:py-20 space-y-8">
        
        {/* Search and Filters Hub */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-2xl border border-border shadow-xs">
          {/* Custom Search field */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tech keywords, notice period..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder-text-secondary/50 outline-none focus:border-accent focus:bg-surface focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Filtering tabs */}
          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setExpandedIndex(null); // Reset expansions when filtering
                }}
                className={`px-3.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                  filterCategory === cat
                    ? "bg-text-primary text-background border-text-primary"
                    : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-background"
                }`}
              >
                {cat === "all" ? "⚡ All Inquiries" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ list accordion loop */}
        <div className="space-y-4 min-h-[300px]">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = expandedIndex === idx;
              
              // Get category icon
              let iconColor = "text-sky-500 bg-sky-500/10";
              if (faq.category === "Architectural") iconColor = "text-accent bg-accent/10";
              else if (faq.category === "Consulting") iconColor = "text-sky-400 bg-sky-400/10";
              else iconColor = "text-emerald-500 bg-emerald-500/10";

              return (
                <div 
                  key={idx} 
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden bg-surface ${
                    isOpen ? "border-accent/40 shadow-md shadow-accent/5" : "border-border hover:border-text-secondary/30"
                  }`}
                >
                  <button
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-background/25 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md tracking-wider shrink-0 ${iconColor}`}>
                        {faq.category}
                      </span>
                      <h3 className="text-xs md:text-sm font-bold text-text-primary leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown 
                      size={14} 
                      className={`text-text-secondary transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-accent" : "rotate-0"}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-text-secondary font-medium leading-relaxed border-t border-border bg-background/10 pl-6 md:pl-24">
                          <p className="max-w-2xl">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-surface/50">
              <HelpCircle size={32} className="text-text-secondary/50 mx-auto mb-3" />
              <p className="text-xs text-text-secondary font-medium italic">No questions match your filter or search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
