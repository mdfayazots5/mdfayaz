import { Entry } from "../../models/portfolio.model";

export const ENTRIES_FALLBACK: Entry[] = [
  {
    id: 1,
    type: "company",
    title: "Healthcare Management System (HCM)",
    tagline: "HCM",
    categoryTag: "Healthcare ERP",
    description: "Architected a centralized, web-based Healthcare ERP driving multi-facility hospital administration, live doctor-patient scheduling workflows, and dynamic digital prescription processing.",
    features: [
      "Spearheaded the registration, multi-parameter doctor search, mapping core, and high-security digital prescription models, eliminating patient scheduling friction.",
      "Developed reactive state machines for doctor availability and scheduling, ensuring automatic, collision-free calendar bookings.",
      "Engineered granular administrative features to securely coordinate master records across hospitals, doctors, and auxiliary staff.",
      "Built secure, high-throughput REST APIs and core business microservices in ASP.NET Core matching architectural repository patterns.",
      "Participated directly in agile ceremonies, allocating tasks to 5 developers, performing strict code reviews, and driving fast deployment cycles."
    ],
    tech: ["ASP.NET Core", "Web API", "EF Core", "SQL Server", "Angular", "Clean Architecture"],
    achievements: [
      "Coordinated a 5-developer delivery flow across registration, doctor search, scheduling, and prescription modules.",
      "Reduced scheduling friction by designing automatic availability checks and collision-free booking flows.",
      "Improved maintainability by aligning REST APIs with repository and layered architecture patterns."
    ],
    companyId: 1,
    companyName: "Revalsys Technologies Pvt Ltd",
    role: "Team Lead + Dot Net Developer",
    teamSize: 5,
    startDate: "Feb 2023",
    endDate: "Dec 2023",
    featured: false,
    displayOrder: 1,
    color: "#0EA5E9",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/1",
    icon: "🏥"
  },
  {
    id: 2,
    type: "company",
    title: "Requisition & Onboarding System (HRMS)",
    tagline: "HRMS",
    categoryTag: "HRMS / Recruitment",
    description: "Built a cohesive Human Resource Management SaaS application automating end-to-end recruitment pipelines, multi-partner assignments, and automated candidate onboarding.",
    features: [
      "Engineered complete candidate pipelines mapping Job Descriptions (JDs), agency consultant handoffs, dynamic candidate pipelines, and automated offer letters.",
      "Developed multi-phase transactional interview pipelines with hierarchical roles-based authorization filters and centralized feedback trackers.",
      "Designed custom checklist engines managing post-offer document validation, occupational health clearances, and IT onboarding triggers.",
      "Delivered scalable RESTful endpoints and highly indexed relational database structures in ASP.NET Core and SQL Server."
    ],
    tech: ["ASP.NET Core", "Web API", "EF Core", "SQL Server", "Angular", "RBAC"],
    achievements: [
      "Mapped recruitment, consultant handoff, interview feedback, offer-letter, and onboarding workflows into one HRMS pipeline.",
      "Improved operational visibility with role-based filters and centralized feedback tracking for hiring stakeholders.",
      "Designed checklist-driven onboarding flows to reduce manual document validation and follow-up work."
    ],
    companyId: 1,
    companyName: "Revalsys Technologies Pvt Ltd",
    role: "Team Lead + Dot Net Developer",
    teamSize: 5,
    startDate: "Jan 2024",
    endDate: "Aug 2024",
    featured: false,
    displayOrder: 2,
    color: "#8B5CF6",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/2",
    icon: "👥"
  },
  {
    id: 3,
    type: "company",
    title: "TrusTerra (Vehicle Marketplace & Inspection Platform)",
    tagline: "TrusTerra",
    categoryTag: "Automotive & eCommerce",
    description: "Designed an interactive peer-to-peer automotive marketplace introducing rigorous condition checklists, Firebase push alerts, and direct buyer-to-seller handshakes.",
    features: [
      "Architected real-time catalogs, full-text catalog searching, wishlist state persistence, and modular inventory management platforms.",
      "Constructed a granular, standardized inspection checklist interface to document exact automobile health parameters, reducing marketplace data asymmetry.",
      "Configured and integrated Firebase Cloud Messaging (FCM) system pipelines delivering transactional push notifications across Web, Android, and iOS channels.",
      "Crafted backend API pathways and optimized relational database queries, maintaining sub-120ms execution times under heavy traffic loads."
    ],
    tech: ["ASP.NET Core", "Web API", "EF Core", "SQL Server", "Firebase Cloud Messaging (FCM)", "Mobile Push"],
    achievements: [
      "Reduced marketplace data gaps by introducing standardized vehicle inspection checklists and structured seller inputs.",
      "Kept high-traffic catalog interactions responsive through optimized relational queries and focused API paths.",
      "Enabled transactional Web, Android, and iOS push notifications through Firebase Cloud Messaging integration."
    ],
    companyId: 1,
    companyName: "Revalsys Technologies Pvt Ltd",
    role: "Dot Net Developer",
    startDate: "Sep 2024",
    endDate: "May 2026",
    featured: false,
    displayOrder: 3,
    color: "#10B981",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/3",
    icon: "⚡"
  },
  {
    id: 4,
    type: "personal",
    title: "Coolzo",
    tagline: "Premium AC service & field-operations platform",
    description: "Coolzo (CoolElite) is an end-to-end platform for premium AC service businesses — spanning online booking, smart technician dispatch, on-site field workflow, invoicing, and Annual Maintenance Contracts. Customers book and track jobs like a premium delivery, while technicians run the full on-site flow from a mobile app.",
    status: "Live",
    categoryTag: "Field Service SaaS",
    tech: ["ASP.NET Core", "Angular", "EF Core", "SQL Server", "PostgreSQL", "Firebase FCM"],
    features: [
      "Booking-to-invoice lifecycle with smart technician dispatch and live job tracking",
      "Mobile field workflow: GPS check-in, checklists, photos, e-signature, and on-site payment",
      "Role-based admin portal with AMC automation, inventory, and billing across 15+ roles"
    ],
    audience: "Premium AC service companies and their field teams",
    liveUrl: "https://www.coolzo.in/",
    repoUrl: "https://github.com/mdfayazots5/Coolzo",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/4",
    icon: "Snowflake",
    featured: true,
    displayOrder: 4,
    color: "#1B2A4A",
    achievements: [
      "Designed a booking-to-invoice service lifecycle covering customers, technicians, admins, inventory, payments, and AMC workflows.",
      "Built role-based operations across 15+ business roles for field-service teams.",
      "Added technician mobile workflows for GPS check-in, checklists, photos, e-signature, and on-site payment."
    ]
  },
  {
    id: 5,
    type: "personal",
    title: "GoWithFlow",
    tagline: "Grow Together — live spoken-language practice",
    description: "GoWithFlow is a collaborative speaking-practice platform. Learners join live sessions with a join code, read scripts aloud, and receive pronunciation and grammar feedback from voice analysis — then repractice their mistakes. Progress is tracked with streaks, badges, and improvement analytics.",
    status: "Live",
    categoryTag: "EdTech · Speaking",
    tech: [".NET 8", "Angular", "SignalR", "EF Core", "SQL Server", "PostgreSQL"],
    features: [
      "Real-time live speaking sessions with join codes and turn-taking (SignalR)",
      "Voice analysis with pronunciation and grammar mistake tracking, plus guided repractice",
      "Progress dashboard with streaks, badges, and grammar improvement trends"
    ],
    audience: "Language learners building spoken fluency together",
    liveUrl: "https://gowithflow-ui.pages.dev/",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/5",
    icon: "Mic",
    featured: true,
    displayOrder: 5,
    color: "#8B5CF6",
    achievements: [
      "Designed real-time speaking sessions with join codes and turn-taking using SignalR.",
      "Built a feedback loop for pronunciation, grammar mistakes, repractice, streaks, and badges.",
      "Structured progress analytics so learners can see repeat mistakes and measurable improvement."
    ]
  },
  {
    id: 6,
    type: "personal",
    title: "Family First",
    tagline: "All-in-one family coordination & care platform",
    description: "FamilyFirst is a family-management PWA that brings tasks, attendance, rewards, a shared calendar, medical records, safety, and elder care into one app. Each member gets a role-tailored experience — parents, children, teachers, and elders — with photo-verified chores and smart reminders.",
    status: "In Development",
    categoryTag: "Family PWA",
    tech: [".NET 8", "React 19", "TypeScript", "EF Core", "SQL Server", "Firebase FCM", "AWS S3"],
    features: [
      "Task, attendance, and reward system with photo-verified chores",
      "Shared calendar, medical vault, and safety modules for the whole family",
      "Role-based experiences for parents, children, teachers, and elders"
    ],
    audience: "Families coordinating daily tasks, care, and schedules",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/6",
    icon: "HeartHandshake",
    featured: false,
    displayOrder: 6,
    color: "#10B981",
    achievements: [
      "Modeled role-specific experiences for parents, children, teachers, and elders in a single family PWA.",
      "Designed photo-verified task workflows, shared calendar coordination, medical vault, and safety modules.",
      "Planned cloud-backed media storage and push notification flows for daily family coordination."
    ]
  },
  {
    id: 7,
    type: "personal",
    title: "Portfolio CMS",
    tagline: "This site — a self-serve portfolio with a headless CMS",
    description: "The portfolio you're reading: a React 19 site with an admin CMS backed by a Cloudflare Worker and R2 storage. It's backend-optional — content is served from the R2 CMS in production and falls back to local seed data — so every section is editable without a redeploy.",
    status: "Live",
    categoryTag: "Portfolio · CMS",
    tech: ["React 19", "TypeScript", "Tailwind CSS", "Cloudflare Workers", "R2", "CI/CD"],
    features: [
      "Self-serve admin CMS for projects, services, and site content",
      "Cloudflare Worker API + R2 storage, backend-optional with local fallback",
      "Recruiter-focused minimal design with automated OG image generation"
    ],
    audience: "Recruiters and collaborators evaluating my work",
    liveUrl: "https://mdfayaz.pages.dev",
    repoUrl: "https://github.com/mdfayazots5/FayazMd",
    caseStudyUrl: "https://mdfayaz.pages.dev/#project/7",
    icon: "LayoutDashboard",
    featured: false,
    displayOrder: 7,
    color: "#0EA5E9",
    achievements: [
      "Built a self-serve admin CMS so portfolio content can be updated without redeploying the frontend.",
      "Connected Cloudflare Worker APIs to R2 JSON storage with authenticated mutations and public read endpoints.",
      "Added media upload, theme selection, SEO metadata, and fallback data paths for resilient content delivery."
    ]
  }
];
