import { FaqItem } from "../../models/portfolio.model";

export const FAQ_FALLBACK: FaqItem[] = [
  {
    id: 1,
    question: "What is your primary software architectural style?",
    answer: "I advocate for Clean Architecture with Domain-Driven Design (DDD) principles. This involves separating the databases, domain models, business handlers, and web controllers into distinct project libraries, dramatically reducing coupling and supporting parallel developer sprints.",
    category: "Architectural"
  },
  {
    id: 2,
    question: "How do you ensure .NET API performance under massive volume?",
    answer: "I prioritize database index tuning, eager loading prevention (via EF Core Select mappings), caching mechanisms using memory or Redis, and asynchronous request handling. In SQL Server, I profile dense queries via execution plan analyzer tools to find high CPU/IO costs.",
    category: "Consulting"
  },
  {
    id: 3,
    question: "What is your transition, onboarding, or recruitment notice period?",
    answer: "I am ready for immediate deployment and can initiate team standups or legacy code transitions within 0 to 15 days of contract alignment or hiring confirmation.",
    category: "Recruitment"
  },
  {
    id: 4,
    question: "Do you have working experience with agile teams?",
    answer: "Yes. I have actively led a 5-developer agile team in delivering critical SaaS module pipelines, establishing clear repository guidelines, leading daily standups, and resolving code integration bottlenecks.",
    category: "Recruitment"
  },
  {
    id: 5,
    question: "Are you open to hybrid, onsite, or remote schedules?",
    answer: "Currently, I am based in Hyderabad, India, with a highly optimized, dual-monitor, 500Mbps remote home office. I am open to hybrid schedules inside Hyderabad, as well as fully remote roles worldwide overlapping Western, European, or APAC schedules.",
    category: "Recruitment"
  },
  {
    id: 6,
    question: "What is your experience with database migrations or relational modelling?",
    answer: "I have years of experience with Microsoft SQL Server, PostgreSQL, and Entity Framework Core migrations. I focus on safe migrations, schema normalization, custom index structures, and high-integrity stored procedures.",
    category: "Architectural"
  },
  {
    id: 7,
    question: "Can you consult on legacy code modernizations?",
    answer: "Yes. I help organizations decouple legacy monoblocks into clean microservices, transition old .NET Framework platforms into ASP.NET Core 8+, optimize database performance bottlenecks, and introduce testable layered architectures.",
    category: "Consulting"
  }
];
