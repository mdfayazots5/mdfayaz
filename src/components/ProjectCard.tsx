import React from "react";
import { Terminal, Briefcase, Calendar, CheckSquare, Users, User, ExternalLink, Github, BookOpen, Video, Trophy } from "lucide-react";

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
  
  // new Entry fields
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
  // Support both frontend models and backend models dynamically
  const category = project.type || project.category || (project.roleType === "creator" ? "personal" : "company");
  const timeline = project.timeline || (project.startDate && project.endDate ? `${project.startDate} — ${project.endDate}` : `${project.startDate || ""}`);
  const displayTitle = project.title || project.name || "";
  const overview = project.shortOverview || project.description || "";
  const responsibilities = project.responsibilities || project.bullets || [];
  const techStack = project.techStack || project.tech || [];
  const role = project.role || "";

  return (
    <div 
      id={`project-card-${project.id}`}
      className="p-8 md:p-10 bg-surface border border-border rounded-3xl hover:border-accent/60 hover:shadow-lg transition-all duration-300 space-y-6 text-left"
    >
      {/* Top Header of Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
              {category === "company" ? "Professional Work Experience" : "Personal Product Showcase"}
            </span>
            {project.companyName && (
              <>
                <span className="text-text-secondary/30 text-xs">•</span>
                <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider bg-background px-2 py-0.5 rounded-md border border-border">
                  {project.companyName}
                </span>
              </>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary tracking-tight">
            {displayTitle}
          </h3>
        </div>

        {/* Timeline & Metadata */}
        <div className="flex flex-col md:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary font-mono tracking-wider">
            <Calendar size={13} className="text-text-secondary" />
            <span>{timeline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent font-mono tracking-wider uppercase">
            <Briefcase size={13} />
            <span>{role}</span>
          </div>
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
        </div>
      </div>

      {/* Short Overview Section in Plain language */}
      {overview && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            The Overview
          </h4>
          <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">
            {overview}
          </p>
        </div>
      )}

      {/* Key Responsibilities */}
      {responsibilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Key Responsibilities & Deliverables
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responsibilities.map((resp, i) => (
              <li 
                key={i} 
                className="flex items-start gap-2.5 p-3.5 bg-background/50 rounded-2xl border border-border hover:bg-surface/50 hover:border-border transition-colors duration-200"
              >
                <CheckSquare size={14} className="text-accent shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack Footer */}
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
                className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-3.5 py-1.5 bg-surface border border-border text-text-primary rounded-xl hover:border-accent/40 hover:bg-background transition-all duration-300"
              >
                <Terminal size={11} className="text-accent" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quantified Impact / Achievements */}
      {project.achievements && project.achievements.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/30 animate-fade-in">
          <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <Trophy size={13} className="text-emerald-500" />
            Quantified Impact & Achievements
          </h4>
          <ul className="space-y-2">
            {project.achievements.map((ach, i) => (
              <li 
                key={i} 
                className="flex items-start gap-2.5 p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-colors"
              >
                <span className="text-emerald-500 font-bold text-xs shrink-0 mt-0.5">✦</span>
                <span className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">{ach}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Proof Links */}
      {(project.liveUrl || project.repoUrl || project.caseStudyUrl || project.videoUrl) && (
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase tracking-wider">
              <ExternalLink size={12} />
              <span>Live Site</span>
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase tracking-wider">
              <Github size={12} />
              <span>Repository</span>
            </a>
          )}
          {project.caseStudyUrl && (
            <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase tracking-wider">
              <BookOpen size={12} />
              <span>Case Study</span>
            </a>
          )}
          {project.videoUrl && (
            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase tracking-wider">
              <Video size={12} />
              <span>Demo Video</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
