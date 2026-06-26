import React, { useEffect, useState } from "react";
import { getAboutProfile, updateAboutProfile } from "../../services/api";
import { AboutProfile } from "../../models/portfolio.model";
import { LoadingScreen } from "../LoadingScreen";
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Layout, 
  Users, 
  Briefcase, 
  X, 
  FolderPlus, 
  CheckCircle, 
  Sliders,
  AlertTriangle,
  Tag
} from "lucide-react";

export const AdminAboutPage: React.FC = () => {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBioTab, setActiveBioTab] = useState<"architect" | "lead" | "developer">("architect");
  const [newCatName, setNewCatName] = useState("");
  // Input tracking state for adding skills per category index
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getAboutProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load about profile:", err);
        showToast("Error loading about profile.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveAll = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const success = await updateAboutProfile(profile);
      if (success) {
        showToast("About profile updated successfully.");
      } else {
        showToast("Failed to save changes.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network mistake or service error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Tagline update
  const handleTaglineChange = (val: string) => {
    if (!profile) return;
    setProfile({ ...profile, tagline: val });
  };

  // Bios updates
  const handleBioChange = (key: "architectBio" | "leadBio" | "developerBio", val: string) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: val });
  };

  // Skill category operations
  const handleAddCategory = () => {
    if (!profile || !newCatName.trim()) return;
    
    // Check if category already exists
    const exists = profile.skills.some(
      (c) => c.category.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      showToast("Skill category already exists.", "error");
      return;
    }

    const updatedSkills = [...profile.skills, { category: newCatName.trim(), items: [] }];
    setProfile({ ...profile, skills: updatedSkills });
    setNewCatName("");
    showToast(`Category "${newCatName.trim()}" added.`);
  };

  const handleConfirmDeleteCategory = (index: number) => {
    if (!profile) return;
    const updatedSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({ ...profile, skills: updatedSkills });
    setCategoryToDelete(null);
    showToast("Category and its skills deleted.");
  };

  const handleAddSkill = (catIndex: number) => {
    if (!profile) return;
    const skillValue = newSkillInputs[catIndex] || "";
    if (!skillValue.trim()) return;

    const updatedSkills = [...profile.skills];
    const categorySkills = updatedSkills[catIndex];

    // Avoid duplicates
    if (categorySkills.items.some(s => s.toLowerCase() === skillValue.trim().toLowerCase())) {
      showToast("Skill already exists in this category.", "error");
      return;
    }

    categorySkills.items = [...categorySkills.items, skillValue.trim()];
    setProfile({ ...profile, skills: updatedSkills });

    // Clear input state
    setNewSkillInputs(prev => ({ ...prev, [catIndex]: "" }));
  };

  const handleRemoveSkill = (catIndex: number, skillIndex: number) => {
    if (!profile) return;
    const updatedSkills = [...profile.skills];
    updatedSkills[catIndex].items = updatedSkills[catIndex].items.filter((_, i) => i !== skillIndex);
    setProfile({ ...profile, skills: updatedSkills });
  };

  // Timeline operations
  const handleAddTimelineEntry = () => {
    if (!profile) return;
    const newEntry = {
      company: "New Company",
      role: "Developer",
      period: "2026 — Present",
      description: "Roles, objectives, technology, metrics, and accomplishments detail."
    };
    setProfile({
      ...profile,
      experienceTimeline: [...profile.experienceTimeline, newEntry]
    });
    showToast("Added new empty timeline entry.");
  };

  const handleUpdateTimelineEntry = (index: number, field: string, val: string) => {
    if (!profile) return;
    const updatedTimeline = [...profile.experienceTimeline];
    updatedTimeline[index] = {
      ...updatedTimeline[index],
      [field]: val
    };
    setProfile({ ...profile, experienceTimeline: updatedTimeline });
  };

  const handleDeleteTimelineEntry = (index: number) => {
    if (!profile) return;
    const updatedTimeline = profile.experienceTimeline.filter((_, i) => i !== index);
    setProfile({ ...profile, experienceTimeline: updatedTimeline });
    showToast("Timeline entry removed.");
  };

  const handleSortTimeline = (index: number, direction: "up" | "down") => {
    if (!profile) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.experienceTimeline.length) return;

    const updatedTimeline = [...profile.experienceTimeline];
    const tempEntry = updatedTimeline[index];
    updatedTimeline[index] = updatedTimeline[targetIndex];
    updatedTimeline[targetIndex] = tempEntry;

    setProfile({ ...profile, experienceTimeline: updatedTimeline });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-500">Error</h3>
        <p className="text-text-secondary">Failed to retrieve the profile metadata.</p>
      </div>
    );
  }

  return (
    <div id="admin-about-root" className="space-y-10 animate-fade-in text-left">
      
      {/* Toast Notification */}
      {message && (
        <div 
          className={`fixed bottom-6 right-6 z-[200] max-w-md p-4 rounded-xl shadow-lg border border-border flex items-center gap-3 transition-all duration-300 ${
            message.type === "success" 
              ? "bg-surface text-text-primary" 
              : "bg-surface text-red-500 border-red-500/20"
          }`}
        >
          <CheckCircle size={16} className={message.type === "success" ? "text-accent" : "text-red-500"} />
          <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight uppercase">About Profile Settings</h2>
          <p className="text-xs text-text-secondary mt-1">
            Modify developer persona tagline, tri-perspective bios, skill cards, and the career roadmap
          </p>
        </div>
      </div>

      {/* 1. Tagline Section */}
      <section className="bg-surface p-6 rounded-2xl border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="text-accent" size={16} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Tagline & Quick Profile</h3>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
            About Section Hero Tagline
          </label>
          <input
            type="text"
            value={profile.tagline}
            onChange={(e) => handleTaglineChange(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all font-sans"
            placeholder="Introduce yourself comprehensively..."
          />
        </div>
      </section>

      {/* 2. Biographies Tabs Section */}
      <section className="bg-surface p-6 rounded-2xl border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Tri-Perspective Bios</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-text-secondary uppercase">
            Active view: {activeBioTab}
          </span>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-border gap-1.5 pb-0.5">
          {(["architect", "lead", "developer"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveBioTab(tab)}
              className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                activeBioTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab} Bio
            </button>
          ))}
        </div>

        {/* Tab content textareas */}
        <div className="space-y-2">
          {activeBioTab === "architect" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                Architect Persona Biography Block
              </label>
              <textarea
                value={profile.architectBio}
                onChange={(e) => handleBioChange("architectBio", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs font-sans focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all leading-relaxed"
                placeholder="Describe architectural perspectives, system-design paradigms, resilience philosophies..."
              />
            </div>
          )}

          {activeBioTab === "lead" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                Technical Lead Biography Block
              </label>
              <textarea
                value={profile.leadBio}
                onChange={(e) => handleBioChange("leadBio", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs font-sans focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all leading-relaxed"
                placeholder="Detail product modules delivered, team coordinates directed, Agile velocity workflows..."
              />
            </div>
          )}

          {activeBioTab === "developer" && (
            <div className="space-y-1.5 animate-fade-in flex flex-col">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                Systems Developer Biography Block
              </label>
              <textarea
                value={profile.developerBio}
                onChange={(e) => handleBioChange("developerBio", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs font-sans focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all leading-relaxed"
                placeholder="Highlight developer routines, languages, code quality, fast feedback loops..."
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. Skill Matrices Section */}
      <section className="space-y-6">
        <div className="flex border-b border-border pb-3 justify-between items-center">
          <div className="flex items-center gap-2">
            <Tag className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Skills Cards Matrix
            </h3>
          </div>
        </div>

        {/* Skill groups grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.skills.map((cat, catIndex) => (
            <div 
              key={catIndex} 
              className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Card category head */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-text-primary">
                    {cat.category}
                  </h4>
                  
                  {categoryToDelete === catIndex ? (
                    <div className="flex items-center gap-2 animate-fade-in bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                      <span className="text-[9px] font-mono font-bold uppercase text-red-500">Confirm?</span>
                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteCategory(catIndex)}
                        className="text-red-500 hover:text-white px-1.5 py-0.5 bg-red-500 hover:bg-red-600 rounded text-[9px] font-bold uppercase cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(null)}
                        className="text-text-secondary hover:text-text-primary text-[9px] font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(catIndex)}
                      className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                      title="Remove Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Tag items wrapper */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {cat.items.length === 0 ? (
                    <span className="text-[10px] italic text-text-secondary font-mono">No skills. Add some below.</span>
                  ) : (
                    cat.items.map((item, itemIndex) => (
                      <span 
                        key={itemIndex} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background text-text-primary rounded-xl border border-border text-[10px] font-mono font-semibold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(catIndex, itemIndex)}
                          className="text-text-secondary hover:text-red-500 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Add tag inline form */}
              <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInputs[catIndex] || ""}
                  onChange={(e) => setNewSkillInputs(prev => ({ ...prev, [catIndex]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(catIndex);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-[10px] font-mono focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                  placeholder="+ Add skill..."
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(catIndex)}
                  className="p-2 border border-border bg-background hover:bg-accent hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new Category panel */}
        <div className="bg-surface border border-border rounded-2xl p-5 max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <FolderPlus className="text-accent" size={14} />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
              Create New Empty Card Group
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
              placeholder="e.g. Frontend, DevOps..."
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Group</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Experiences Timeline Section */}
      <section className="space-y-6">
        <div className="flex border-b border-border pb-3 justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Experience Career Roadmaps
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddTimelineEntry}
            className="flex items-center gap-1.5 px-4 py-2 border border-border bg-surface hover:border-accent/40 text-text-primary hover:text-accent rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Plus size={12} />
            <span>Add Career Entry</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile.experienceTimeline.length === 0 ? (
            <div className="bg-surface p-8 text-center rounded-2xl border border-border">
              <p className="text-xs text-text-secondary italic">No career entries configured.</p>
            </div>
          ) : (
            profile.experienceTimeline.map((item, index) => (
              <div 
                key={index} 
                className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm relative group"
              >
                {/* Item Index Handle bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-accent">
                      {index + 1}
                    </span>
                    <span className="text-xs font-mono font-semibold text-text-secondary uppercase">
                      Timeline Step Details
                    </span>
                  </div>

                  {/* Ordering and remove controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleSortTimeline(index, "up")}
                      className="p-1.5 border border-border bg-background rounded-lg hover:text-accent disabled:opacity-40 disabled:hover:text-text-secondary cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === profile.experienceTimeline.length - 1}
                      onClick={() => handleSortTimeline(index, "down")}
                      className="p-1.5 border border-border bg-background rounded-lg hover:text-accent disabled:opacity-40 disabled:hover:text-text-secondary cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTimelineEntry(index)}
                      className="p-1.5 border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Timeline Inline Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={item.company}
                      onChange={(e) => handleUpdateTimelineEntry(index, "company", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                      placeholder="e.g. Revalsys Technologies Pvt. Ltd."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                      Role / Position Title
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleUpdateTimelineEntry(index, "role", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                      placeholder="e.g. Dot Net Developer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                      Period / Time Frame
                    </label>
                    <input
                      type="text"
                      value={item.period}
                      onChange={(e) => handleUpdateTimelineEntry(index, "period", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                      placeholder="e.g. Feb 2023 — May 2026"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                    Description / Highlights
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleUpdateTimelineEntry(index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-sans focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all leading-relaxed"
                    placeholder="Details about achievements, responsibilities, or recognition..."
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Command Save Trigger Bar */}
      <div className="pt-6 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3 bg-text-primary text-background hover:bg-accent hover:text-white disabled:bg-text-secondary/40 disabled:text-text-secondary/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md shadow-text-primary/10"
        >
          <Save size={14} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "Saving changes..." : "Save About Settings"}</span>
        </button>
      </div>
      
    </div>
  );
};
