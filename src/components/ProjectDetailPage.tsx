import React, { useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  Users,
  User,
  CheckSquare,
  Terminal,
  Trophy,
  ExternalLink,
  Github,
  BookOpen,
  Video,
} from "lucide-react";

interface ProjectDetailPageProps {
  project: any | undefined;
  onBack: () => void;
  onContact: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, onBack, onContact }) => {
  useEffect(() => {
    if (project) {
      const title = project.title || project.name || "Project";
      document.title = `${title} | Mohammed Fayaz`;
    }
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 select-none">
        <h2 className="text-2xl font-luxury font-bold text-text-primary mb-2">Project not found</h2>
        <p className="text-sm text-text-secondary mb-6">This project may have been moved or unpublished.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all cursor-pointer"
        >
          Back to work
        </button>
      </div>
    );
  }

  const category = project.type || project.category || "company";
  const isCompany = category === "company";
  const title = project.title || project.name || "";
  const overview = project.description || project.shortOverview || "";
  const responsibilities: string[] = project.features || project.responsibilities || project.bullets || [];
  const techStack: string[] = project.tech || project.techStack || [];
  const achievements: string[] = project.achievements || [];
  const role = project.role || "";
  const timeline =
    project.timeline ||
    (project.startDate && project.endDate
      ? `${project.startDate} — ${project.endDate}`
      : project.startDate || "");
  const cover = project.coverImage || "";

  // Only render a proof link when it points somewhere real — no empty or "#" dead buttons.
  const isRealLink = (href?: string) => !!href && href.trim() !== "" && href.trim() !== "#";
  const proofLinks = [
    { href: project.liveUrl, label: "Live Site", Icon: ExternalLink },
    { href: project.repoUrl, label: "Repository", Icon: Github },
    { href: project.caseStudyUrl, label: "Case Study", Icon: BookOpen },
    { href: project.videoUrl, label: "Demo Video", Icon: Video },
  ].filter((l) => isRealLink(l.href));

  return (
    <div className="bg-background min-h-screen pt-28 md:pt-32 pb-24 text-left select-none text-text-primary">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to {isCompany ? "experience" : "projects"}</span>
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.25em]">
            {isCompany ? "Professional Experience" : "Personal Project"}
          </span>
          {project.companyName && (
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider bg-surface px-2 py-0.5 rounded-md border border-border">
              {project.companyName}
            </span>
          )}
          {project.status && (
            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider bg-surface px-2 py-0.5 rounded-md border border-border">
              {project.status}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-luxury font-bold tracking-tight leading-tight text-text-primary">
          {title}
        </h1>
        {project.tagline && (
          <p className="mt-4 text-base md:text-lg text-text-secondary font-medium leading-relaxed max-w-2xl">
            {project.tagline}
          </p>
        )}

        {/* Meta */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono font-bold text-text-secondary uppercase tracking-wider border-y border-border py-4">
          {timeline && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-accent" />
              {timeline}
            </span>
          )}
          {role && (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase size={13} className="text-accent" />
              {role}
            </span>
          )}
          {project.teamSize !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-accent" />
              Team of {project.teamSize}
            </span>
          ) : (
            isCompany && (
              <span className="inline-flex items-center gap-1.5">
                <User size={13} className="text-accent" />
                Individual Contributor
              </span>
            )
          )}
          {project.audience && (
            <span className="inline-flex items-center gap-1.5">
              <User size={13} className="text-accent" />
              {project.audience}
            </span>
          )}
        </div>

        {/* Cover */}
        {cover && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-border">
            <img src={cover} alt={title} className="w-full max-h-[420px] object-cover" loading="lazy" />
          </div>
        )}

        {/* Overview */}
        {overview && (
          <section className="mt-10 space-y-3">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Overview
            </h2>
            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">{overview}</p>
          </section>
        )}

        {/* Responsibilities / Features */}
        {responsibilities.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {isCompany ? "Responsibilities & Deliverables" : "Key Features"}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 bg-surface rounded-xl border border-border">
                  <CheckSquare size={14} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary font-medium leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tech */}
        {techStack.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Technology Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1.5 bg-surface border border-border text-text-primary rounded-lg"
                >
                  <Terminal size={11} className="text-accent" />
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <Trophy size={13} className="text-emerald-500" /> Quantified Impact
            </h2>
            <ul className="space-y-2">
              {achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <span className="text-emerald-500 font-bold text-xs shrink-0 mt-0.5">+</span>
                  <span className="text-sm text-text-secondary font-medium leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Proof links (open externally in a new tab) */}
        {proofLinks.length > 0 && (
          <section className="mt-10 flex flex-wrap gap-3">
            {proofLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border hover:border-accent text-text-primary hover:text-accent text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                <Icon size={13} />
                <span>{label}</span>
              </a>
            ))}
          </section>
        )}

        {/* Footer CTA */}
        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to {isCompany ? "experience" : "projects"}</span>
          </button>
          <button
            type="button"
            onClick={onContact}
            className="px-6 py-3 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer"
          >
            Discuss this work
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
