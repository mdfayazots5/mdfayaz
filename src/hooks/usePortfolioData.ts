import React, { useState, useEffect } from "react";
import { MasterData, PortfolioData } from "../models/portfolio.model";
import { getAboutProfile, getEntries, getSiteSettings } from "../services/api";

function locationShort(location: string): string {
  return location
    .split(",")
    .slice(0, 2)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export const usePortfolioData = (portfolioType: number) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getEntries(), getSiteSettings(), getAboutProfile()])
      .then(([entries, settings, about]) => {
        if (isMounted) {
          const timeline = about.experienceTimeline?.[0];
          const companyEntries = entries.filter((entry) => entry.type === "company");
          const personalEntries = entries.filter((entry) => entry.type === "personal");
          const domainCount = new Set(entries.map((entry) => entry.categoryTag).filter(Boolean)).size;
          const teamLed = companyEntries.reduce((max, entry) => Math.max(max, entry.teamSize || 0), 0);

          const master: MasterData = {
            candidate: {
              name: settings.name,
              role: settings.role,
              tagline: settings.tagline || about.tagline,
              email: settings.contactEmail,
              phone: settings.socialLinks?.mobile || "",
              location: settings.location,
              locationShort: locationShort(settings.location),
              notice: settings.availability,
              openToRelocation: settings.openToRelocation,
              github: settings.socialLinks?.github || "",
              linkedin: settings.socialLinks?.linkedin || "",
              portfolio: settings.resumeUrl || "#",
              dob: settings.socialLinks?.dob || "",
              blog: settings.blog,
            },
            stats: {
              years: settings.yearsExperience,
              modules: `${entries.length}+`,
              domains: domainCount,
              users: "",
              perfImprovement: "",
              teamLed,
            },
            company: {
              name: timeline?.company || companyEntries[0]?.companyName || "",
              location: settings.location,
              startDate: companyEntries[0]?.startDate || "",
              endDate: companyEntries[companyEntries.length - 1]?.endDate || "",
              type: timeline?.role || "",
            },
            skills: (about.skills || []).map((skill) => ({
              category: skill.category,
              items: skill.items,
              level: 0,
            })),
            projects: entries as any,
            achievements: [
              ...companyEntries.flatMap((entry) =>
                (entry.achievements || []).map((achievement) => ({
                  icon: entry.icon,
                  title: entry.title,
                  org: entry.companyName || entry.categoryTag,
                  description: achievement,
                  metric: entry.categoryTag,
                })),
              ),
              ...personalEntries.flatMap((entry) =>
                (entry.achievements || []).map((achievement) => ({
                  icon: entry.icon,
                  title: entry.title,
                  org: entry.categoryTag,
                  description: achievement,
                  metric: entry.status || "Personal",
                })),
              ),
            ],
          };

          setData({
            master,
          });
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch portfolio data");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [portfolioType]);

  return { data, loading, error };
};


