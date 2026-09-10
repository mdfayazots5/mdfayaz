import React from "react";
import { Building2, Calendar, MapPin, Globe } from "lucide-react";
import { CompanyProfile } from "../models/portfolio.model";
import { ProjectCard } from "./ProjectCard";

interface WorkExperienceProps {
  /** Company-type entries. */
  entries: any[];
  companies: CompanyProfile[];
}

interface Group {
  key: string;
  company?: CompanyProfile;
  fallbackName?: string;
  entries: any[];
}

/**
 * Groups company experiences under the company they were built at. Each company gets a
 * header card (from the Company Master) with its projects nested underneath, so adding a
 * second company keeps everything cleanly separated instead of one flat list.
 */
export const WorkExperience: React.FC<WorkExperienceProps> = ({ entries, companies }) => {
  const map = new Map<string, Group>();
  entries.forEach((e) => {
    const key =
      e.companyId != null ? `id:${e.companyId}` : e.companyName ? `name:${e.companyName}` : "none";
    if (!map.has(key)) {
      const company =
        e.companyId != null
          ? companies.find((c) => c.id === e.companyId)
          : companies.find((c) => c.name === e.companyName);
      map.set(key, { key, company, fallbackName: e.companyName, entries: [] });
    }
    map.get(key)!.entries.push(e);
  });

  const groups = [...map.values()].sort(
    (a, b) => (a.company?.displayOrder ?? 999) - (b.company?.displayOrder ?? 999)
  );

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-sm mx-auto space-y-4">
        <Building2 className="w-8 h-8 text-text-secondary/50 mx-auto" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No experience yet</h3>
        <p className="text-xs text-text-secondary leading-relaxed">Company experience will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10">
      {groups.map((group) => {
        const c = group.company;
        const name = c?.name || group.fallbackName || "Independent";
        return (
          <section key={group.key} className="space-y-5">
            {/* Company header card */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-7">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 overflow-hidden">
                  {c?.logo ? (
                    <img src={c.logo} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h2 className="text-xl md:text-2xl font-luxury font-bold text-text-primary leading-tight">
                      {name}
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary shrink-0">
                      {group.entries.length} {group.entries.length === 1 ? "project" : "projects"}
                    </span>
                  </div>
                  {c?.role && (
                    <p className="text-xs font-bold uppercase tracking-wider text-accent mt-1">{c.role}</p>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-mono font-bold text-text-secondary uppercase tracking-wider mt-3">
                    {(c?.startDate || c?.endDate) && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-accent" />
                        {c?.startDate} {c?.endDate ? `— ${c.endDate}` : ""}
                      </span>
                    )}
                    {c?.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} className="text-accent" />
                        {c.location}
                      </span>
                    )}
                    {c?.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-accent transition-colors normal-case"
                      >
                        <Globe size={12} className="text-accent" />
                        Website
                      </a>
                    )}
                  </div>
                  {c?.description && (
                    <p className="text-sm text-text-secondary font-medium leading-relaxed mt-3">{c.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Projects at this company */}
            <div className="space-y-4 md:pl-6 md:border-l-2 md:border-border/60">
              {group.entries.map((e, i) => (
                <ProjectCard key={e.id} project={e} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
