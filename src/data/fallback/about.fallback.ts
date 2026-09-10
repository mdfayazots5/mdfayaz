import { AboutProfile } from "../../models/portfolio.model";

export const ABOUT_FALLBACK: AboutProfile = {
  tagline: "Building scalable enterprise systems with .NET Core & Angular | 3+ years delivering high-performance Healthcare, HRMS, and ERP solutions.",
  architectBio: "I architect clean, layered .NET systems that solve business problems across healthcare, HRMS, ERP, and field-service workflows.",
  leadBio: "I lead delivery through sprint planning, code review, task allocation, and production-minded decisions for teams of up to 5 developers.",
  developerBio: "I engineer ASP.NET Core APIs, EF Core data access, optimized SQL Server queries, and Angular interfaces with a focus on maintainability and measurable results.",
  skills: [
    { category: "Backend", items: ["C#", ".NET 8", "ASP.NET Core", "Web API", "REST APIs", "EF Core", "JWT Auth", "Microservices"] },
    { category: "Frontend", items: ["Angular 14+", "TypeScript", "RxJS", "JavaScript", "HTML5", "CSS3", "Responsive UI"] },
    { category: "Database", items: ["SQL Server", "PostgreSQL", "Stored Procedures", "Query Optimization", "Indexing", "Schema Design"] },
    { category: "Architecture", items: ["Clean Architecture", "Repository Pattern", "Layered Architecture", "RBAC", "CQRS", "Modular Design"] },
    { category: "Testing & Quality", items: ["xUnit", "NUnit", "Moq", "Unit Testing", "Code Reviews", "Swagger/OpenAPI"] },
    { category: "Cloud & DevOps", items: ["Azure", "AWS S3", "Docker", "CI/CD", "Azure DevOps", "Redis Caching"] },
    { category: "AI Tools", items: ["GitHub Copilot", "ChatGPT", "Claude AI", "Codex", "Google AI Studio"] }
  ],
  experienceTimeline: [
    {
      company: "Revalsys Technologies Pvt. Ltd.",
      role: "Dot Net Developer",
      period: "Feb 2023 — May 2026",
      description: "Delivered healthcare, HRMS, and marketplace modules while leading reviews, coordinating 5-developer sprint execution, and improving release confidence through cleaner architecture."
    }
  ],
  personalDetails: [
    { id: "pd_location", label: "Location", value: "Hyderabad, Telangana, India" },
    { id: "pd_email", label: "Email", value: "mdfayazots5@gmail.com" },
    { id: "pd_phone", label: "Phone", value: "+91 70954 41960" }
  ],
  education: [
    {
      id: "edu_ba",
      qualification: "Bachelor of Arts",
      institution: "Govt. Model Degree College, Kalwakurthy — Palamuru University, Telangana",
      period: "Jun 2019 – Jul 2022"
    },
    {
      id: "edu_dotnet",
      qualification: ".NET Full Stack Developer (Course)",
      institution: "Sathya Technologies, Ameerpet, Hyderabad",
      period: "Aug 2022 – Jan 2023"
    }
  ]
};
