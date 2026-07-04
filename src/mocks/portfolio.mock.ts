import { MasterData } from "../models/portfolio.model";

// 1. DATABASE CONFIGURATION
export const DB_CONFIG = {
  host: "localhost",
  port: 5432,
  database: "fayaz_portfolio",
  user: "portfolio_user",
  password: "portfolio_pass_2024",
  ssl: false,
  restEndpoint: "https://api.example.com/v1", // Placeholder for REST API
  apiKey: "YOUR_API_KEY"
};

// 2. FLAGS
export const DEMO_MODE = true;
export const PORTFOLIO_FLAG = 5; 

// 3. MASTER DATA
export const MASTER_DATA: MasterData = {
  candidate: {
    name: "Mohammed Fayaz",
    role: "Dot Net Developer",
    tagline: "I build enterprise systems that scale from database to UI — production-ready.",
    email: "mdfayazots5@gmail.com",
    phone: "+91 70954 41960",
    location: "Hyderabad, Telangana, India",
    locationShort: "Hyderabad, India",
    notice: "Immediate",
    openToRelocation: true,
    github: "https://github.com/mdfayazots5",
    linkedin: "https://www.linkedin.com/in/mohammed-fayaz-03a085254/",
    portfolio: "#",
    dob: "26 August 2002",
    blog: "https://dev.to/fayaz_md",
  },
  stats: {
    years: "3.3",
    modules: "15+",
    domains: 3,
    users: "500–2K",
    perfImprovement: "30–50%",
    teamLed: 5,
  },
  company: {
    name: "Revalsys Technologies Pvt. Ltd.",
    location: "Hyderabad, India",
    startDate: "Feb 2023",
    endDate: "May 2026",
    type: "Full-time",
  },
  skills: [
    { category: "Backend",       items: ["C#", "ASP.NET Core", "Web API", "REST APIs", "MVC", "JWT Auth", "Firebase FCM"], level: 90 },
    { category: "Frontend",      items: ["Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", "Web UI"], level: 80 },
    { category: "Database",      items: ["SQL Server", "Stored Procedures", "Query Optimization", "Indexing", "Schema Design"], level: 85 },
    { category: "Architecture",  items: ["Repository Pattern", "Layered Architecture", "RBAC", "Modular Design"], level: 78 },
    { category: "Cloud & Perf",  items: ["Azure", "Redis Caching", "Performance Tuning", "Agile/Scrum"], level: 70 },
    { category: "AI Tools",      items: ["GitHub Copilot", "ChatGPT", "Claude AI", "Codex", "Google AI Studio"], level: 88 },
  ],
  projects: [
    {
      id: 1,
      name: "Healthcare Management System (HCM)",
      shortName: "HCM",
      domain: "Healthcare ERP",
      role: "Team Lead + Dot Net Developer",
      roleType: "lead",
      description: "Architected a centralized, web-based Healthcare ERP driving multi-facility hospital administration, live doctor-patient scheduling workflows, and dynamic digital prescription processing.",
      metrics: { modules: "5+", users: "500–2K", teamSize: 5, domain: "Healthcare" },
      bullets: [
        "Spearheaded the registration, multi-parameter doctor search, mapping core, and high-security digital prescription models, eliminating patient scheduling friction.",
        "Developed reactive state machines for doctor availability and scheduling, ensuring automatic, collision-free calendar bookings.",
        "Engineered granular administrative features to securely coordinate master records across hospitals, doctors, and auxiliary staff.",
        "Built secure, high-throughput REST APIs and core business microservices in ASP.NET Core matching architectural repository patterns.",
        "Participated directly in agile ceremonies, allocating tasks to 5 developers, performing strict code reviews, and driving fast deployment cycles."
      ],
      tech: ["ASP.NET Core", "Web API", "SQL Server", "Web-based UI"],
      color: "#0EA5E9",
      icon: "🏥",
      startDate: "Feb 2023",
      endDate: "Dec 2023",
    },
    {
      id: 2,
      name: "Requisition & Onboarding System (HRMS)",
      shortName: "HRMS",
      domain: "HRMS / Recruitment",
      role: "Team Lead + Dot Net Developer",
      roleType: "lead",
      description: "Built a cohesive Human Resource Management SaaS application automating end-to-end recruitment pipelines, multi-partner assignments, and automated candidate onboarding.",
      metrics: { modules: "6+", pipeline: "End-to-End", teamSize: 5 },
      bullets: [
        "Engineered complete candidate pipelines mapping Job Descriptions (JDs), agency consultant handoffs, dynamic candidate pipelines, and automated offer letters.",
        "Developed multi-phase transactional interview pipelines with hierarchical roles-based authorization filters and centralized feedback trackers.",
        "Designed custom checklist engines managing post-offer document validation, occupational health clearances, and IT onboarding triggers.",
        "Delivered scalable RESTful endpoints and highly indexed relational database structures in ASP.NET Core and SQL Server."
      ],
      tech: ["ASP.NET Core", "Web API", "SQL Server"],
      color: "#8B5CF6",
      icon: "👥",
      startDate: "Jan 2024",
      endDate: "Aug 2024",
    },
    {
      id: 3,
      name: "TrusTerra (Vehicle Marketplace & Inspection Platform)",
      shortName: "TrusTerra",
      domain: "Automotive & eCommerce",
      role: "Dot Net Developer",
      roleType: "developer",
      description: "Designed an interactive peer-to-peer automotive marketplace introducing rigorous condition checklists, Firebase push alerts, and direct buyer-to-seller handshakes.",
      metrics: { notifications: "Firebase FCM", auth: "OTP", verification: "Inspection" },
      bullets: [
        "Architected real-time catalogs, full-text catalog searching, wishlist state persistence, and modular inventory management platforms.",
        "Constructed a granular, standardized inspection checklist interface to document exact automobile health parameters, reducing marketplace data asymmetry.",
        "Configured and integrated Firebase Cloud Messaging (FCM) system pipelines delivering transactional push notifications across Web, Android, and iOS channels.",
        "Crafted backend API pathways and optimized relational database queries, maintaining sub-120ms execution times under heavy traffic loads."
      ],
      tech: ["ASP.NET Core", "Web API", "SQL Server", "Firebase Cloud Messaging (FCM)"],
      color: "#10B981",
      icon: "⚡",
      startDate: "Sep 2024",
      endDate: "May 2026",
    },
  ],
  achievements: [
    {
      icon: "🏆",
      title: "AI Marathon Award",
      org: "Revalsys Technologies — Internal",
      description: "Recognized by leadership for outstanding AI-driven contributions. Completed multiple challenges, earned certificates, improved team productivity via GitHub Copilot, ChatGPT, Claude AI, and Codex.",
      metric: "Multiple Certificates",
    },
    {
      icon: "👥",
      title: "Team Lead — HCM & HRMS Projects",
      org: "Healthcare & HRMS Production Systems",
      description: "Led a 5-developer team on critical enterprise platforms serving hundreds of active users, managing delivery, code reviews, and sprint timelines.",
      metric: "5 Devs · Production Systems",
    },
    {
      icon: "⚡",
      title: "Full Stack Scaling & Push Notifications",
      org: "TrusTerra & SaaS Platforms",
      description: "Developed inspection checklists and secured real-time communication channels by integrating Firebase Cloud Messaging (FCM) push alerts.",
      metric: "FCM Push Integrated",
    },
  ],
};
