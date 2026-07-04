import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { ArrowRight, Download, Briefcase, TrendingUp, Clock, GraduationCap, MapPin } from "lucide-react";
import { AboutProfile, SiteSettings, Service } from "../models/portfolio.model";
import { getAboutProfile, getSiteSettings, getServices } from "../services/api";
import { SectionLoader, SectionError } from "./SectionState";

interface AboutDetailsPageProps {
  handleNavClick: (tab: any, targetId?: string) => void;
}

const resolveIcon = (name?: string) => {
  const Cmp = name ? (Icons as any)[name] : null;
  return Cmp || Icons.Layers;
};

export const AboutDetailsPage: React.FC<AboutDetailsPageProps> = ({ handleNavClick }) => {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    Promise.all([getAboutProfile(), getSiteSettings(), getServices()])
      .then(([profileData, settingsData, servicesData]) => {
        if (isMounted) {
          setProfile(profileData);
          setSettings(settingsData);
          setServices(servicesData || []);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  if (loading) {
    return <SectionLoader label="Loading profile..." minHeight="70vh" />;
  }

  if (error || !profile || !settings) {
    return <SectionError onRetry={() => setReloadKey((k) => k + 1)} minHeight="70vh" />;
  }

  const fullName = settings.name || "Me";
  const firstName = fullName.split(" ")[0];
  const tagline = settings.tagline || profile.tagline || "";
  const yearsDisplay = (() => {
    const n = parseFloat(settings.yearsExperience || "");
    return Number.isFinite(n) ? `${Math.floor(n)}+` : settings.yearsExperience || "";
  })();

  // "At a glance" — only real, known facts.
  const glance = [
    settings.role && { icon: Briefcase, label: "Focus", value: settings.role },
    yearsDisplay && { icon: TrendingUp, label: "Experience", value: `${yearsDisplay} Years` },
    settings.availability && { icon: Clock, label: "Availability", value: settings.availability },
    settings.location && { icon: MapPin, label: "Based in", value: settings.location },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  // Narrative — the "who I am" story, drawn from the tri-perspective bios.
  const narrative = [profile.architectBio, profile.leadBio, profile.developerBio]
    .filter(Boolean)
    .slice(0, 2);

  // "What I do" — published services, else skill groups as a fallback.
  const activeServices = services.filter((s) => s.status === "Active");
  const capabilities =
    activeServices.length > 0
      ? activeServices.slice(0, 6).map((s) => ({ icon: resolveIcon(s.icon), title: s.name, desc: s.tagline }))
      : (profile.skills ?? []).slice(0, 6).map((g) => ({
          icon: Icons.Layers,
          title: g.category,
          desc: g.items.join(" · "),
        }));

  const personalDetails = profile.personalDetails ?? [];
  const education = profile.education ?? [];

  return (
    <div id="about-details-root" className="bg-background min-h-screen pt-28 md:pt-32 pb-24 text-left select-none text-text-primary">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">

        {/* Hero + At a glance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-3xl p-8 md:p-12 flex flex-col justify-center">
            <span className="self-start px-3 py-1 rounded-full bg-background border border-border text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Portfolio
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-luxury font-bold tracking-tight leading-none text-text-primary">
              Hi, I'm <span className="text-accent">{firstName}.</span>
            </h1>
            {tagline && (
              <p className="mt-5 text-base md:text-lg text-text-secondary font-medium leading-relaxed max-w-xl">
                {tagline}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => handleNavClick("contact")}
                className="group inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Work with me</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => handleNavClick("products")}
                className="inline-flex items-center gap-2 px-5 py-3 bg-background border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                View projects
              </button>
              {settings.resumeUrl && settings.resumeUrl !== "#" && (
                <a
                  href={settings.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-background border border-border text-text-primary hover:border-accent hover:text-accent text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  <span>Resume</span>
                  <Download size={13} />
                </a>
              )}
            </div>
          </div>

          {/* At a glance */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-luxury font-bold text-text-primary mb-5">At a glance</h2>
            <div className="space-y-3">
              {glance.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.label} className="p-4 rounded-2xl bg-background border border-border">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Icon size={13} className="text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{g.label}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-text-primary">{g.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Purpose / Who I am */}
        {narrative.length > 0 && (
          <div className="bg-surface border border-border rounded-3xl p-8 md:p-12">
            <span className="px-3 py-1 rounded-full bg-background border border-border text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              About Me
            </span>
            <h2 className="mt-6 text-2xl md:text-3xl font-luxury font-bold text-text-primary">
              Who I am
            </h2>
            <div className="mt-5 space-y-4 max-w-4xl">
              {narrative.map((para, idx) => (
                <p key={idx} className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* What I do */}
        {capabilities.length > 0 && (
          <section className="pt-8">
            <h2 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary">What I do</h2>
            <p className="mt-2 text-sm text-text-secondary font-medium">
              Product-minded development with design sensitivity and system rigor.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <div key={idx} className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-5">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{c.title}</h3>
                    {c.desc && (
                      <p className="mt-2 text-sm text-text-secondary font-medium leading-relaxed">{c.desc}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Personal details */}
        {personalDetails.length > 0 && (
          <section className="pt-8">
            <h2 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary">Personal details</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalDetails.map((d) => (
                <div key={d.id} className="bg-surface border border-border rounded-2xl p-5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    {d.label}
                  </span>
                  <span className="mt-1.5 text-sm font-bold text-text-primary block break-words">{d.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="pt-8">
            <h2 className="text-2xl md:text-3xl font-luxury font-bold text-text-primary">Education</h2>
            <div className="mt-6 relative border-l border-border pl-6 md:pl-8 space-y-8">
              {education.map((edu) => (
                <div key={edu.id} className="relative">
                  <span className="absolute -left-[31px] md:-left-[39px] top-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <GraduationCap size={14} />
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h3 className="text-base font-luxury font-bold text-text-primary">{edu.qualification}</h3>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary shrink-0">
                      {edu.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary font-medium leading-relaxed">{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-6 bg-surface border border-border rounded-3xl p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-accent uppercase tracking-[0.3em] block">LET'S CONNECT</span>
            <h4 className="text-lg font-luxury font-bold text-text-primary">Have a role or project in mind?</h4>
            <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-lg">
              I'm {settings.availability?.toLowerCase() || "open to new opportunities"} — reach out anytime.
            </p>
          </div>
          <button
            onClick={() => handleNavClick("contact")}
            className="px-6 py-3 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 rounded-xl cursor-pointer shrink-0"
          >
            Get in Touch
          </button>
        </div>

      </div>
    </div>
  );
};

export default AboutDetailsPage;
