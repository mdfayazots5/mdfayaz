import { AboutProfile } from "../../models/portfolio.model";

export const ABOUT_FALLBACK: AboutProfile = {
  tagline: "I build enterprise systems that scale from database to UI — production-ready.",
  architectBio: "Building robust enterprise systems that scale from database to UI — designed for resilience, modularity, and long-term maintainability.",
  leadBio: "Led delivery of key Enterprise SaaS modules (HCM, HRMS) directing 5-developer agile teams and delivering zero-collision scheduling models.",
  developerBio: "Focused on shipping fast C# backend microservices, optimized SQL Server queries, and clean Angular user interfaces.",
  skills: [
    { category: "Backend", items: ["C#", "ASP.NET Core", "Web API", "REST APIs", "MVC", "JWT Auth", "Firebase FCM"] },
    { category: "Frontend", items: ["Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", "Web UI"] },
    { category: "Database", items: ["SQL Server", "Stored Procedures", "Query Optimization", "Indexing", "Schema Design"] },
    { category: "Architecture", items: ["Repository Pattern", "Layered Architecture", "RBAC", "Modular Design"] },
    { category: "Cloud & Perf", items: ["Azure", "Redis Caching", "Performance Tuning", "Agile/Scrum"] },
    { category: "AI Tools", items: ["GitHub Copilot", "ChatGPT", "Claude AI", "Codex", "Google AI Studio"] }
  ],
  experienceTimeline: [
    {
      company: "Revalsys Technologies Pvt. Ltd.",
      role: "Dot Net Developer",
      period: "Feb 2023 — May 2026",
      description: "Recognized with the AI Marathon Award for pioneering AI-driven development workflows and delivering high-impact modular systems."
    }
  ]
};
