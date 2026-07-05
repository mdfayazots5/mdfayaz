import React from "react";
import { Briefcase, Calendar, Users, User, ArrowUpRight, ChevronDown, ExternalLink, Github, BookOpen } from "lucide-react";

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
  tagline?: string;
  responsibilities?: string[];
  bullets?: string[];
  features?: string[];
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

/** Desktop (pointer devices) can hover to reveal; touch devices tap to reveal. */
const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches;

const openDetail = (id: string | number) => {
  window.location.hash = `#project/${id}`;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const [hovered, setHovered] = React.useState(false);
  const [tapped, setTapped] = React.useState(false);
  const show = hovered || tapped;

  React.useEffect(() => {
    const closeWhenAnotherOpens = (event: Event) => {
      const activeId = (event as CustomEvent<string | number>).detail;
      if (String(activeId) !== String(project.id)) {
        setTapped(false);
      }
    };
    window.addEventListener("project-card:preview", closeWhenAnotherOpens);
    return () => window.removeEventListener("project-card:preview", closeWhenAnotherOpens);
  }, [project.id]);

  const category = project.type || project.category || (project.roleType === "creator" ? "personal" : "company");
  const timeline =
    project.timeline ||
    (project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : `${project.startDate || ""}`);
  const displayTitle = project.title || project.name || "";
  const overview = project.tagline || project.shortOverview || project.description || "";
  const role = project.role || "";
  const techStack = project.tech || project.techStack || [];
  // A link is only "real" when it points somewhere — guard against empty and "#"
  // placeholders so dead Case Study / GitHub buttons never render.
  const isRealLink = (href?: string) => !!href && href.trim() !== "" && href.trim() !== "#";
  const proofLinks = [
    { href: project.liveUrl, label: "Live", Icon: ExternalLink },
    { href: project.repoUrl, label: "GitHub", Icon: Github },
    { href: project.caseStudyUrl, label: "Case", Icon: BookOpen },
  ].filter((item) => isRealLink(item.href));

  // Desktop: hover reveals the overview; a click opens the detail page.
  // Touch: first tap reveals the overview; a second tap opens the detail page.
  const handleActivate = () => {
    if (canHover()) {
      openDetail(project.id);
    } else if (tapped) {
      openDetail(project.id);
    } else {
      window.dispatchEvent(new CustomEvent("project-card:preview", { detail: project.id }));
      setTapped(true);
    }
  };

  return (
    <article
      id={`project-card-${project.id}`}
      data-index={index}
      role="button"
      tabIndex={0}
      onMouseEnter={() => canHover() && setHovered(true)}
      onMouseLeave={() => canHover() && setHovered(false)}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      }}
      className={`group p-4 md:p-5 bg-surface border rounded-xl outline-none transition-all duration-300 text-left cursor-pointer ${
        show ? "border-accent/60 shadow-md" : "border-border hover:border-accent/40"
      }`}
    >
      {/* Always-visible header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
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
          <h3 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary tracking-tight leading-tight group-hover:text-accent transition-colors">
            {displayTitle}
          </h3>

          {/* Tech stack up-front — recruiters see the stack without opening the card. */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {techStack.slice(0, 4).map((t, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono font-bold px-2 py-0.5 bg-background border border-border text-text-secondary rounded-md uppercase tracking-wider"
                >
                  {t}
                </span>
              ))}
              {techStack.length > 4 && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 text-text-secondary/70 uppercase tracking-wider">
                  +{techStack.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reveal affordance */}
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary shrink-0 md:pt-1">
          <span>{show ? "Details" : "Overview"}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${show ? "rotate-180 text-accent" : ""}`} />
        </span>
      </div>

      {/* Revealed on hover (desktop) / tap (mobile) */}
      <div className={`grid transition-all duration-300 ease-out ${show ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden space-y-4">
          {/* Meta (date is intentionally hidden until reveal) */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-text-secondary font-mono tracking-wider">
            {timeline && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-accent" />
                {timeline}
              </span>
            )}
            {role && (
              <span className="inline-flex items-center gap-1.5 text-accent uppercase">
                <Briefcase size={13} />
                {role}
              </span>
            )}
            {project.teamSize !== undefined ? (
              <span className="inline-flex items-center gap-1.5 uppercase">
                <Users size={13} />
                Team of {project.teamSize}
              </span>
            ) : (
              category === "company" && (
                <span className="inline-flex items-center gap-1.5 uppercase">
                  <User size={13} />
                  Individual Contributor
                </span>
              )
            )}
          </div>

          {overview && (
            <p className="text-sm text-text-secondary font-medium leading-relaxed">{overview}</p>
          )}

          {proofLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {proofLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-background border border-border hover:border-accent text-text-primary hover:text-accent rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                  <Icon size={11} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          )}

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
            <span>{tapped ? "Tap again to open" : "View full details"}</span>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
};
