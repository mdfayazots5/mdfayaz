import React, { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings } from "../../services/api";
import { SiteSettings, ThemeSet } from "../../models/portfolio.model";
import { normalizeThemeSet } from "../../config/theme-sets";
import { ThemeSetPicker } from "../ThemeSetPicker";
import { useTheme } from "../ThemeProvider";
import { LoadingScreen } from "../LoadingScreen";
import { 
  Save,
  Plus,
  Trash2,
  Users,
  Settings,
  CheckCircle,
  HelpCircle,
  Mail,
  FileText,
  Link,
  MessageSquare,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Plane,
  BookOpen,
  Palette
} from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { setThemeSet: applyThemeSet } = useTheme();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Site-wide default palette for first-time visitors (persisted to R2).
  const [defaultThemeSet, setDefaultThemeSet] = useState<ThemeSet>("slate-classic");
  
  // Flat state fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [openToRelocation, setOpenToRelocation] = useState(false);
  const [yearsExperience, setYearsExperience] = useState("");
  const [blog, setBlog] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [tagline, setTagline] = useState("");
  
  // Social links as array of pairs for dynamic list editing
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSiteSettings();
        if (data) {
          setSettings(data);
          setName(data.name || "");
          setRole(data.role || "");
          setLocation(data.location || "");
          setAvailability(data.availability || "");
          setOpenToRelocation(Boolean(data.openToRelocation));
          setYearsExperience(data.yearsExperience || "");
          setBlog(data.blog || "");
          setContactEmail(data.contactEmail || "");
          setResumeUrl(data.resumeUrl || "");
          setTagline(data.tagline || "");
          setDefaultThemeSet(normalizeThemeSet(data.themeSet));

          // Map object to list of pairs
          const pairsList = Object.entries(data.socialLinks || {}).map(([key, value]) => ({
            platform: key.charAt(0).toUpperCase() + key.slice(1),
            url: value as string
          }));
          setSocialLinks(pairsList);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        showToast("Error loading site settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "LinkedIn", url: "" }]);
  };

  const handleUpdateSocialLink = (index: number, field: "platform" | "url", val: string) => {
    const updated = [...socialLinks];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setSocialLinks(updated);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
    showToast("Social link item removed from the list.");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) {
      showToast("Contact email is required.", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      // Re-map list back to object shape with dynamic keys, matching the original fallback format
      const socialObj: Record<string, string> = {};
      socialLinks.forEach((item) => {
        if (item.platform.trim()) {
          socialObj[item.platform.trim().toLowerCase()] = item.url.trim();
        }
      });

      const updatedPayload: SiteSettings = {
        name: name.trim(),
        role: role.trim(),
        location: location.trim(),
        availability: availability.trim(),
        openToRelocation,
        yearsExperience: yearsExperience.trim(),
        blog: blog.trim(),
        contactEmail: contactEmail.trim(),
        resumeUrl: resumeUrl.trim(),
        tagline: tagline.trim(),
        socialLinks: {
          github: socialObj.github || "",
          linkedin: socialObj.linkedin || "",
          dob: socialObj.dob || "",
          mobile: socialObj.mobile || "",
          ...socialObj
        },
        // Preserve admin-managed media (owned by the Media page). Both pages PUT the full
        // SiteSettings object, so carrying these through prevents a settings save from wiping
        // an uploaded profile image / hero background.
        profileImage: settings.profileImage,
        heroBackground: settings.heroBackground,
        themeSet: defaultThemeSet
      };

      const success = await updateSiteSettings(updatedPayload);
      if (success) {
        setSettings(updatedPayload);
        showToast("Site settings saved successfully.");
      } else {
        showToast("Failed to save site settings.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating site config.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-500">Error</h3>
        <p className="text-text-secondary">Failed to retrieve configuration metadata.</p>
      </div>
    );
  }

  const PRESET_PLATFORMS = ["LinkedIn", "GitHub", "Twitter/X", "Mobile", "Dob", "Other"];

  return (
    <div id="admin-settings-root" className="space-y-10 animate-fade-in text-left">
      
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

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-luxury font-bold tracking-tight uppercase">Site Settings</h2>
        <p className="text-xs text-text-secondary mt-1">
          Configure your identity (name, role, location, availability), headline stats, brand tagline, resume, contact details, and social credentials
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* Identity & Profile Section */}
        <section className="bg-surface p-6 rounded-2xl border border-border space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <User className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Identity & Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <User size={11} className="text-text-secondary" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. Mohammed Fayaz"
              />
            </div>

            {/* Headline Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Briefcase size={11} className="text-text-secondary" />
                Headline Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. .NET Full Stack Developer"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <MapPin size={11} className="text-text-secondary" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. Hyderabad, Telangana, India"
              />
            </div>

            {/* Availability / Notice */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Calendar size={11} className="text-text-secondary" />
                Availability / Notice Period
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. Immediate"
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Briefcase size={11} className="text-text-secondary" />
                Years of Experience (headline stat)
              </label>
              <input
                type="text"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. 3.3"
              />
            </div>

            {/* Blog URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <BookOpen size={11} className="text-text-secondary" />
                Blog URL (optional)
              </label>
              <input
                type="text"
                value={blog}
                onChange={(e) => setBlog(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. https://dev.to/mdfayaz"
              />
            </div>
          </div>

          {/* Open to Relocation toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={openToRelocation}
              onChange={(e) => setOpenToRelocation(e.target.checked)}
              className="w-4 h-4 accent-accent cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Plane size={11} className="text-text-secondary" />
              Open to Relocation
            </span>
          </label>
        </section>

        {/* Theme Set — site-wide default palette for first-time visitors */}
        <section className="bg-surface p-6 rounded-2xl border border-border space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <Palette className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Default Theme Set</h3>
          </div>
          <p className="text-[11px] text-text-secondary -mt-2">
            The palette first-time visitors see. Returning visitors keep their own chosen theme.
            Selecting one here previews it live and saves it as the site default.
          </p>
          <ThemeSetPicker
            value={defaultThemeSet}
            onChange={(ts) => {
              setDefaultThemeSet(ts);
              applyThemeSet(ts); // live preview for the admin
            }}
            showHeader={false}
            className="max-w-md"
          />
        </section>

        {/* Core Parameters Section */}
        <section className="bg-surface p-6 rounded-2xl border border-border space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <Settings className="text-accent" size={16} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Core Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Mail size={11} className="text-text-secondary" />
                Contact Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. mdfayazots5@gmail.com"
                required
              />
            </div>

            {/* Resume URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <FileText size={11} className="text-text-secondary" />
                Resume Resource Link / URL
              </label>
              <input
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all"
                placeholder="e.g. # or enterprise resume url"
              />
            </div>
          </div>

          {/* Site Tagline */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <MessageSquare size={11} className="text-text-secondary" />
              Primary Site Tagline
            </label>
            <textarea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-xs font-sans focus:ring-1 focus:ring-accent focus:border-accent outline-none text-text-primary transition-all leading-relaxed"
              placeholder="e.g. Scalable enterprise systems designed from database to UI — modular."
            />
          </div>
        </section>

        {/* Dynamic Social Accounts Section */}
        <section className="bg-surface p-6 rounded-2xl border border-border space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Link className="text-accent" size={16} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Social Links & Anchors</h3>
            </div>
            
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="flex items-center gap-1 px-3 py-1.5 border border-border bg-background hover:border-accent/40 text-text-primary hover:text-accent rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Anchor Link</span>
            </button>
          </div>

          <div className="space-y-4">
            {socialLinks.length === 0 ? (
              <div className="text-center py-6 text-text-secondary text-xs italic">
                No social links defined. Let's add some!
              </div>
            ) : (
              socialLinks.map((item, index) => (
                <div 
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-background p-4 rounded-xl border border-border/60 group relative"
                >
                  {/* Platform selector or manual input */}
                  <div className="sm:w-1/4">
                    <label className="block text-[8px] font-mono font-bold uppercase text-text-secondary mb-1">
                      Platform Name
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={PRESET_PLATFORMS.includes(item.platform) ? item.platform : "Other"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== "Other") {
                            handleUpdateSocialLink(index, "platform", val);
                          }
                        }}
                        className="px-2 py-2 bg-surface border border-border rounded-lg text-[11px] font-mono text-text-primary outline-none focus:ring-1 focus:ring-accent"
                      >
                        {PRESET_PLATFORMS.map((preset) => (
                          <option key={preset} value={preset}>
                            {preset}
                          </option>
                        ))}
                      </select>
                      
                      {(!PRESET_PLATFORMS.includes(item.platform) || item.platform === "Other") && (
                        <input
                          type="text"
                          value={item.platform === "Other" ? "" : item.platform}
                          onChange={(e) => handleUpdateSocialLink(index, "platform", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-[11px] font-mono outline-none text-text-primary"
                          placeholder="Type other..."
                        />
                      )}
                    </div>
                  </div>

                  {/* Anchor Target Address Link */}
                  <div className="flex-1">
                    <label className="block text-[8px] font-mono font-bold uppercase text-text-secondary mb-1">
                      Resource Anchor Value / URL Link
                    </label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdateSocialLink(index, "url", e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-mono outline-none text-text-primary focus:ring-1 focus:ring-accent"
                      placeholder="e.g. https://github.com/profile or mobile number"
                    />
                  </div>

                  {/* Remove buttons */}
                  <div className="sm:pt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(index)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                      title="Delete Social Anchor Link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Action Save Bar */}
        <div className="pt-6 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-text-primary text-background hover:bg-accent hover:text-white disabled:bg-text-secondary/40 disabled:text-text-secondary/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md shadow-text-primary/10"
          >
            <Save size={14} className={isSaving ? "animate-spin" : ""} />
            <span>{isSaving ? "Saving Config..." : "Save Settings"}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
