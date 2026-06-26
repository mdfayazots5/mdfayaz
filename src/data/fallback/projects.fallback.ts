import { Project } from "../../models/portfolio.model";

export const PROJECTS_FALLBACK: Project[] = [
  {
    id: 1,
    name: "Healthcare Management System (HCM)",
    shortName: "HCM",
    domain: "Healthcare ERP",
    role: "Team Lead + Dot Net Developer",
    roleType: "lead",
    category: "company",
    companyName: "Revalsys Technologies",
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
    timeline: "Feb 2023 — Dec 2023"
  },
  {
    id: 2,
    name: "Requisition & Onboarding System (HRMS)",
    shortName: "HRMS",
    domain: "HRMS / Recruitment",
    role: "Team Lead + Dot Net Developer",
    roleType: "lead",
    category: "company",
    companyName: "Revalsys Technologies",
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
    timeline: "Jan 2024 — Aug 2024"
  },
  {
    id: 3,
    name: "TrusTerra (Vehicle Marketplace & Inspection Platform)",
    shortName: "TrusTerra",
    domain: "Automotive & eCommerce",
    role: "Dot Net Developer",
    roleType: "developer",
    category: "company",
    companyName: "Revalsys Technologies",
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
    timeline: "Sep 2024 — May 2026"
  },
  {
    id: 5,
    name: "Go With Flow (Kanban Portfolio Board)",
    shortName: "Go With Flow",
    domain: "Project Management Utility",
    role: "Creator & Frontend Lead",
    roleType: "creator",
    category: "personal",
    description: "A frictionless project tracking board and Kanban visualizer built to assist developers in planning work, tracking deadlines, and managing workflows.",
    metrics: { flow: "Drag & Drop", state: "Local" },
    bullets: [
      "Implemented dynamic drag-and-drop state boards allowing visual priority adjustments.",
      "Developed lazy-loaded layout models ensuring instant client-side transitions.",
      "Added automated visual warnings to spot overdue milestones or blocked boards."
    ],
    tech: ["React", "TypeScript", "Tailwind CSS", "motion", "LocalStorage"],
    color: "#3B82F6",
    icon: "📋",
    startDate: "Jan 2024",
    endDate: "Feb 2025",
    timeline: "2024 — 2025"
  },
  {
    id: 6,
    name: "Family First (Cooperative Care Hub)",
    shortName: "Family First",
    domain: "Cooperative Ecosystem",
    role: "Full-Stack Creator",
    roleType: "creator",
    category: "personal",
    description: "A secure cooperative ecosystem enabling active families to organize tasks, log health checkups, and dispatch private safety notices.",
    metrics: { group: "Invite-only", alerts: "SMS/FCM" },
    bullets: [
      "Coded secure private logging registers and shared helper calendars strictly for invited family circles.",
      "Configured reactive high-priority mobile alert alerts to support real-time family responses.",
      "Created sleek layouts featuring high-contrast typography, fully accessible across tablet and mobile displays."
    ],
    tech: ["React", "C#", "ASP.NET Core", "SQL Server", "Tailwind CSS"],
    color: "#EF4444",
    icon: "🏠",
    startDate: "Jan 2025",
    endDate: "Dec 2025",
    timeline: "2025"
  }
];
