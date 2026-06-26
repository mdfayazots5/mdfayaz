import { Product } from "../../models/portfolio.model";

export const PRODUCTS_FALLBACK: Product[] = [
  {
    id: 1,
    name: "PulseTrack",
    tagline: "Lightweight uptime and service monitoring for small teams",
    description: "PulseTrack is a self-hosted monitoring tool for tracking API and service uptime, with configurable health checks and real-time alerts. Built to give small teams visibility into their infrastructure without relying on expensive third-party monitoring platforms.",
    status: "In Development",
    categoryTag: "Monitoring Tool",
    tech: ["ASP.NET Core", "SQL Server", "SignalR"],
    features: [
      "HTTP and database health checks with custom intervals",
      "Real-time alerting via email and webhook",
      "Public status pages for transparency"
    ],
    audience: "Engineering teams running small-scale infrastructure",
    icon: "Activity",
    displayOrder: 1
  },
  {
    id: 2,
    name: "LinkFolio",
    tagline: "A customizable link-in-bio page for creators and freelancers",
    description: "LinkFolio lets users build a personal landing page with custom links, themes, and click analytics. Designed for creators and freelancers who want a clean, branded hub for their online presence.",
    status: "Live",
    categoryTag: "Web App",
    tech: ["React", "ASP.NET Core", "SQL Server"],
    features: [
      "Drag-and-drop link organization",
      "Click and visitor analytics",
      "Multiple theme presets with custom branding"
    ],
    audience: "Creators, freelancers, and small businesses",
    icon: "Link2",
    displayOrder: 2
  },
  {
    id: 3,
    name: "TaskRelay",
    tagline: "Visual workflow automation for repetitive business tasks",
    description: "TaskRelay is a workflow automation tool that lets users chain together API calls, conditions, and scheduled jobs through a visual builder. Aimed at small businesses looking to automate routine processes without writing code.",
    status: "Private Beta",
    categoryTag: "Automation Platform",
    tech: ["ASP.NET Core", "Angular", "Hangfire"],
    features: [
      "Drag-and-drop workflow builder",
      "Scheduled and event-triggered runs",
      "Built-in connectors for common APIs"
    ],
    audience: "Small businesses automating manual workflows",
    icon: "Workflow",
    displayOrder: 3
  },
  {
    id: 4,
    name: "NotesVault",
    tagline: "Secure notes and code snippet manager for developers",
    description: "NotesVault is a personal notes and code snippet manager with end-to-end encryption, tagging, and full-text search. Built for developers who want a private space to store reference material and reusable code.",
    status: "Completed",
    categoryTag: "Productivity Tool",
    tech: ["ASP.NET Core", "Angular", "SQL Server"],
    features: [
      "End-to-end encrypted storage",
      "Syntax-highlighted code snippets",
      "Tag-based organization and full-text search"
    ],
    audience: "Developers and individuals managing personal references",
    icon: "Lock",
    displayOrder: 4
  }
];
