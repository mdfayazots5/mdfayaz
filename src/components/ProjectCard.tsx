import React from "react";
import {
  Terminal,
  Briefcase,
  Calendar,
  CheckSquare,
  Users,
  User,
  ExternalLink,
  Github,
  BookOpen,
  Video,
  Trophy,
  ChevronDown,
} from "lucide-react";

export interface ProjectData {
  id: string | number;
  name?: string;
  title?: string;
  category?: "company" | "personal";
  type?: "company" | "personal";
  companyName?: string;
  role?: string;
  timeline?: string;
  shortOverview?: string;
  description?: string;
  responsibilities?: string[];
  bullets?: string[];
  techStack?: string[];
  tech?: string[];
  startDate?: string;
  endDate?: string;
  roleType?: string;
  teamSize?: number;
  achievements?: string[];
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  videoUrl?: string;
  color?: string;
  icon?: string;
  categoryTag?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const [expanded, setExpanded] = React.useState(false);
  const category = project.type || project.category || (project.roleType === "creator" ? "personal" : "company");
  const timeline =
    project.timeline ||
    (project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : `${project.startDate || ""}`);
  const displayTitle = project.title || project.name || "";
  const overview = project.shortOverview || project.description || "";
  const responsibilities = project.responsibilities || project.bullets || [];
  const techStack = project.techStack || project.tech || [];
  const role = project.role || "";

  const proofLinks = [
    { href: project.liveUrl, label: "Live Site", Icon: ExternalLink },
    { href: project.repoUrl, label: "Repository", Icon: Github },
    { href: project.caseStudyUrl, label: "Case Study", Icon: BookOpen },
    { href: project.videoUrl, label: "Demo Video", Icon: Video },
  ].filter((link) => !!link.href);

  return (
    <article
      id={`project-card-${project.id}`}
      data-index={index}
      tabIndex={0}
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setExpanded((value) => !value);
        }
      }}
      className="group p-4 md:p-5 bg-surface border border-border rounded-xl hover:border-accent/60 focus:border-accent/60 hover:shadow-md focus:shadow-md outline-none transition-all duration-300 space-y-4 text-left cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
              {category === "company" ? "Professional Experience" : "Personal Product"}
            </span>
            {project.companyName && (
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider bg-background px-2 py-0.5 rounded-md border border-border">
                {project.companyName}
              </span>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary tracking-tight leading-tight">
            {displayTitle}
          </h3>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
            Click to view details
          </span>
        </div>

        <div className="flex flex-wrap md:flex-col md:items-end gap-2 md:gap-1.5 shrink-0">
          {timeline && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary font-mono tracking-wider">
              <Calendar size={13} className="text-text-secondary" />
              <span>{timeline}</span>
            </div>
          )}
          {role && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent font-mono tracking-wider uppercase">
              <Briefcase size={13} />
              <span>{role}</span>
            </div>
          )}
          {project.teamSize !== undefined ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary font-mono tracking-wider uppercase">
              <Users size={13} />
              <span>Team of {project.teamSize}</span>
            </div>
          ) : (
            category === "company" && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary font-mono tracking-wider uppercase">
                <User size={13} />
                <span>Individual Contributor</span>
              </div>
            )
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            <span>{expanded ? "Close" : "Open"}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${expanded ? "rotate-180 text-accent" : ""}`}
            />
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden space-y-5 border-t border-border pt-5">
          {overview && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Overview
              </h4>
              <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">
                {overview}
              </p>
            </div>
          )}

          {responsibilities.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Responsibilities & Deliverables
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {responsibilities.map((resp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-background/50 rounded-xl border border-border"
                  >
                    <CheckSquare size={14} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {techStack.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    id={`tech-stack-pill-${project.id}-${idx}`}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 bg-background border border-border text-text-primary rounded-lg"
                  >
                    <Terminal size={11} className="text-accent" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.achievements && project.achievements.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/30">
              <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <Trophy size={13} className="text-emerald-500" />
                Quantified Impact
              </h4>
              <ul className="space-y-2">
                {project.achievements.map((ach, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10"
                  >
                    <span className="text-emerald-500 font-bold text-xs shrink-0 mt-0.5">+</span>
                    <span className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {proofLinks.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
              {proofLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase tracking-wider"
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
