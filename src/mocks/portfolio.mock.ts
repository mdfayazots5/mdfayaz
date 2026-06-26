import { MasterData, TransactionData } from "../models/portfolio.model";

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
    github: "https://github.com/mdfayaz", 
    linkedin: "https://linkedin.com/in/mdfayaz",
    portfolio: "#",
    dob: "26 August 2002",
    blog: "https://dev.to/mdfayaz",
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

// 4. PORTFOLIO TRANSACTION DATA
export const PORTFOLIO_TRANSACTION_DATA: Record<string, TransactionData> = {
  type5: {
    manifesto: [
      "I believe software should solve real problems, not create new ones.",
      "Performance is a feature, not an afterthought.",
      "Clean code is a professional obligation.",
      "The best architecture is the one your team can maintain at 2am.",
      "AI tools are force multipliers for thoughtful developers.",
    ],
    caseStudies: [
      {
        number: "01",
        project: "HCM",
        headline: "Streamlining Multi-Facility Healthcare Operations",
        problem: "Hospital networks relied on disjointed manual workflows for appointments, doctor calendars, and prescription handling, creating critical data bottlenecks.",
        approach: "Led a team of five to design an ASP.NET Core centralized ERP with automated doctor calendars, mapping algorithms, and secure digital prescription channels.",
        result: "Paper worksheets was fully automated; hospital operations, patient registrations, and doctor schedules consolidated into a zero-collision unified system.",
        keyMetric: "Team Lead of 5 Developers",
      },
      {
        number: "02",
        project: "HRMS",
        headline: "Automating Enterprise Hiring and Compliant Onboarding",
        problem: "Recruiting cycles were slowed by disjointed emails, disconnected external agencies, and prolonged manual document-verification bottlenecks.",
        approach: "Engineered a systematic ATS/HRMS in ASP.NET Core, incorporating conditional workflows, feedback logging, and automated compliance checklist triggers.",
        result: "Transitioned the HR pipeline to an entirely self-guided workflow, reducing candidate-to-offer times and document clearing delays.",
        keyMetric: "Team Lead of 5 Developers",
      },
      {
        number: "03",
        project: "TrusTerra",
        headline: "Engineering Transparency in Peer-to-Peer Car Sales",
        problem: "Used-car marketplaces suffer from severe condition mistrust and delayed communication regarding wishlist status and inspections.",
        approach: "Created a rigid automotive checklist evaluator and live Firebase alerts coupled with OTP security, built on top of ASP.NET Core and SQL Server.",
        result: "Instantly pushed SMS and push alerts about inspect actions and verified checklists directly to user devices, reducing transaction uncertainty.",
        keyMetric: "Firebase FCM Integration",
      },
    ],
    selectedWork: "Selected Work — 2023 to 2026",
    closingStatement: "Looking for a .NET developer who takes full ownership? Let's talk.",
  },
};
