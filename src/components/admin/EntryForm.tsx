import React, { useEffect, useState } from "react";
import { getEntries, createEntry, updateEntry } from "../../services/api";
import { Entry } from "../../models/portfolio.model";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";

interface EntryFormProps {
  entryId?: string | number;
}

export const EntryForm: React.FC<EntryFormProps> = ({ entryId }) => {
  const isEditMode = !!entryId;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Common Fields
  const [type, setType] = useState<"company" | "personal">("company");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [description, setDescription] = useState("");
  const [tech, setTech] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [achievements, setAchievements] = useState<string[]>([""]);

  // Proof Links
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [caseStudyUrl, setCaseStudyUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Company Specific Fields
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [teamSize, setTeamSize] = useState<number | undefined>(undefined);

  // Personal Specific Fields
  const [status, setStatus] = useState("Live");
  const [audience, setAudience] = useState("");
  const [icon, setIcon] = useState("Package");
  const [coverImage, setCoverImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;
    async function loadEntryDetails() {
      try {
        const entries = await getEntries();
        const found = entries.find(e => String(e.id) === String(entryId));
        if (found && isMounted) {
          setType(found.type);
          setTitle(found.title || "");
          setTagline(found.tagline || "");
          setCategoryTag(found.categoryTag || "");
          setDescription(found.description || "");
          
          if (found.tech && found.tech.length > 0) {
            setTech(found.tech);
          } else {
            setTech([""]);
          }

          if (found.features && found.features.length > 0) {
            setFeatures(found.features);
          } else {
            setFeatures([""]);
          }

          if (found.achievements && found.achievements.length > 0) {
            setAchievements(found.achievements);
          } else {
            setAchievements([""]);
          }

          setLiveUrl(found.liveUrl || "");
          setRepoUrl(found.repoUrl || "");
          setCaseStudyUrl(found.caseStudyUrl || "");
          setVideoUrl(found.videoUrl || "");

          setCompanyName(found.companyName || "");
          setRole(found.role || "");
          setStartDate(found.startDate || "");
          setEndDate(found.endDate || "");
          setTeamSize(found.teamSize);

          setStatus(found.status || "Live");
          setAudience(found.audience || "");
          setIcon(found.icon || "Package");
          setCoverImage(found.coverImage || "");
          setDisplayOrder(found.displayOrder || 0);
        } else if (isMounted) {
          setFeedback({ text: `Entry with ID ${entryId} could not be retrieved from database.`, type: "error" });
        }
      } catch (err) {
        console.error("Load entry details exception:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEntryDetails();
    return () => {
      isMounted = false;
    };
  }, [entryId, isEditMode]);

  // Array Field Handlers (Tech)
  const handleAddTech = () => setTech([...tech, ""]);
  const handleRemoveTech = (index: number) => {
    const updated = tech.filter((_, i) => i !== index);
    setTech(updated.length > 0 ? updated : [""]);
  };
  const handleUpdateTech = (index: number, val: string) => {
    const updated = [...tech];
    updated[index] = val;
    setTech(updated);
  };

  // Array Field Handlers (Features/Responsibilities)
  const handleAddFeature = () => setFeatures([...features, ""]);
  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated.length > 0 ? updated : [""]);
  };
  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  // Array Field Handlers (Achievements/Impact)
  const handleAddAchievement = () => setAchievements([...achievements, ""]);
  const handleRemoveAchievement = (index: number) => {
    const updated = achievements.filter((_, i) => i !== index);
    setAchievements(updated.length > 0 ? updated : [""]);
  };
  const handleUpdateAchievement = (index: number, val: string) => {
    const updated = [...achievements];
    updated[index] = val;
    setAchievements(updated);
  };

  const handleBack = () => {
    window.location.hash = "#admin/entries";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !tagline.trim() || !categoryTag.trim()) {
      setFeedback({ text: "Title, Tagline, and Category Tag are required parameters.", type: "error" });
      return;
    }

    if (type === "company" && (!role.trim() || !startDate.trim() || !endDate.trim() || !companyName.trim())) {
      setFeedback({ text: "Company Name, Role, Start Date, and End Date are required for Professional Work entries.", type: "error" });
      return;
    }

    setSaving(true);

    const filteredTech = tech.map(t => t.trim()).filter(Boolean);
    const filteredFeatures = features.map(f => f.trim()).filter(Boolean);
    const filteredAchievements = achievements.map(a => a.trim()).filter(Boolean);

    const payload: Partial<Entry> = {
      type,
      title: title.trim(),
      tagline: tagline.trim(),
      categoryTag: categoryTag.trim(),
      description: description.trim(),
      tech: filteredTech,
      features: filteredFeatures,
      achievements: filteredAchievements,
      liveUrl: liveUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      caseStudyUrl: caseStudyUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      ...(type === "company" ? {
        companyName: companyName.trim(),
        role: role.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        teamSize: teamSize !== undefined ? Number(teamSize) : undefined,
      } : {
        status: status.trim(),
        audience: audience.trim() || undefined,
        icon: icon.trim() || "Package",
        coverImage: coverImage.trim() || undefined,
        displayOrder: Number(displayOrder),
      })
    };

    try {
      if (isEditMode) {
        await updateEntry(entryId!, payload);
        setFeedback({ text: "Entry specifications successfully updated.", type: "success" });
      } else {
        await createEntry(payload);
        setFeedback({ text: "Success! New entry registered to unified portfolio data.", type: "success" });
        // Reset states
        setTitle("");
        setTagline("");
        setCategoryTag("");
        setDescription("");
        setTech([""]);
        setFeatures([""]);
        setAchievements([""]);
        setLiveUrl("");
        setRepoUrl("");
        setCaseStudyUrl("");
        setVideoUrl("");
        setCompanyName("");
        setRole("");
        setStartDate("");
        setEndDate("");
        setTeamSize(undefined);
        setStatus("Live");
        setAudience("");
        setIcon("Package");
        setCoverImage("");
        setDisplayOrder(0);
      }
    } catch (err) {
      console.error("Save failed:", err);
      setFeedback({ text: "Connection error / server failed to commit Entry payload.", type: "error" });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="entry-form-root" className="space-y-8 animate-fade-in text-left">
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 group text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio Registry</span>
        </button>
      </div>

      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-luxury font-bold tracking-tight">
          {isEditMode ? "Edit Portfolio Entry" : "Register New Portfolio Entry"}
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          {isEditMode 
            ? `Modify settings for database unified entry with ID: ${entryId}`
            : "Describe the objectives, achievements, metrics, and tech parameters for a new portfolio node"
          }
        </p>
      </div>

      {feedback && (
        <div 
          id="form-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border flex items-center gap-2 justify-center ${
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-8 sm:p-10 rounded-3xl border border-border space-y-8">
        {/* Core Settings Block */}
        <div className="bg-background/40 p-6 rounded-2xl border border-border/60 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-accent)] block">
              Entry Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors cursor-pointer"
              disabled={isEditMode}
            >
              <option value="company">🏢 Company (Professional Work Experience)</option>
              <option value="personal">🛠️ Personal (Side Projects & Products)</option>
            </select>
            {isEditMode && <p className="text-[9px] text-text-secondary/80">Entry type cannot be changed after creation.</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
              Category Tag / Domain Label *
            </label>
            <input
              type="text"
              value={categoryTag}
              onChange={(e) => setCategoryTag(e.target.value)}
              placeholder="e.g., ERP System, SaaS Automation, Developer Tool"
              className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Global Core Fields */}
        <div id="general-metadata" className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border pb-2">
            General Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                {type === "company" ? "Project Name *" : "Product / App Name *"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "company" ? "e.g., TrustTerra" : "e.g., Watchtower"}
                className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                Short Tagline *
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., High-throughput credit transaction processing pipeline"
                className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
              Overview Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a plain-language summary of core problem, solution, and architecture context..."
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors resize-y"
            />
          </div>
        </div>

        {/* Conditional Sections */}
        {type === "company" ? (
          <div id="company-extra-specs" className="space-y-6 pt-4 border-t border-border/80">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
              🏢 Corporate Context Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Revalsys Technologies"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Professional Role *
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Lead Developer"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Start Timeline *
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="e.g., Feb 2023"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    End Timeline *
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="e.g., May 2026, Present"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={teamSize === undefined ? "" : teamSize}
                    onChange={(e) => setTeamSize(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="personal-extra-specs" className="space-y-6 pt-4 border-t border-border/80">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
              🛠️ Creator / Niche Product Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Target Audience / Segment
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Indie Hackers, DevOps SREs"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5 shadow-sm">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-text-secondary block">
                    Display Order (ASC)
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    placeholder="e.g., 1 border"
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Product Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Live">🟢 Live</option>
                    <option value="In Development">🟡 In Dev</option>
                    <option value="Private Beta">🟣 Private Beta</option>
                    <option value="Completed">🔵 Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Lucide Icon Name
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Package, Activity, Shield..."
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary block">
                    Cover / Preview Image URL
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Links Row */}
        <div id="proof-links" className="space-y-6 pt-4 border-t border-border/80">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
            🔗 Public Proof Links & Case Studies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                Live URL
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-mono focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                Code Repository (GitHub)
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-mono focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                Case Study URL
              </label>
              <input
                type="text"
                value={caseStudyUrl}
                onChange={(e) => setCaseStudyUrl(e.target.value)}
                placeholder="https://medium.com/..."
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-mono focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                Video Demo URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Lists Row: Features/Responsibilities */}
        <div className="border-t border-border/80 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
                {type === "company" ? "Key Responsibilities & System Contributions" : "Product Features / Specifications"}
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Bullet points outlining developer responsibilities, backend pipelines, and architecture highlights
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={11} />
              <span>Add Feature</span>
            </button>
          </div>

          <div className="space-y-3">
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <span className="text-[10px] font-mono font-bold text-text-secondary bg-background border border-border w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                  placeholder="e.g., Designed secure database architectures using Entity Framework Core and SQL Server"
                  className="flex-1 px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-2.5 border border-border hover:border-red-500/40 text-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-xl cursor-pointer shrink-0 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Lists Row: Achievements */}
        <div className="border-t border-border/80 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
                🏆 Quantified Impact & Achievements
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                List achievements with clear metrics (e.g., "Reduced latency by 40% using Redis caches")
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddAchievement}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#10B981]/20 bg-[#10B981]/5 hover:bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={11} />
              <span>Add Achievement</span>
            </button>
          </div>

          <div className="space-y-3 font-medium">
            {achievements.map((ach, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={ach}
                  onChange={(e) => handleUpdateAchievement(idx, e.target.value)}
                  placeholder="e.g., Optimized SQL queries to speed up report exporting pipeline by 60%"
                  className="flex-1 px-4 py-2.5 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(idx)}
                  className="p-2.5 border border-border hover:border-red-500/40 text-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-xl cursor-pointer shrink-0 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies List */}
        <div className="border-t border-border/80 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">
                💻 Technology Stack & Tools
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Identify programming frameworks and SDKs used to design the parameters of this project
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTech}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
            >
              <Plus size={11} />
              <span>Add Tech Tag</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tech.map((tool, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => handleUpdateTech(idx, e.target.value)}
                  placeholder="e.g., ASP.NET Core"
                  className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent rounded-xl text-xs font-medium focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTech(idx)}
                  className="p-2 border border-border hover:border-red-500/40 text-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-xl cursor-pointer shrink-0 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions Button Toolbar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3.5 border border-border hover:bg-background text-text-primary font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancel Actions
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : (isEditMode ? "Update Entry Settings" : "Commit Entry Registration")}
          </button>
        </div>
      </form>
    </div>
  );
};
