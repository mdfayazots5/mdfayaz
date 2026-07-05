import React, { useEffect, useRef, useState } from "react";
import { getCompanies, createCompany, updateCompany, deleteCompany, uploadFile } from "../../services/api";
import { CompanyProfile } from "../../models/portfolio.model";
import { Plus, Edit2, Trash2, X, Building2, MapPin, Calendar, Upload, Image as ImageIcon } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const EMPTY = {
  name: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  website: "",
  logo: "",
  displayOrder: 1,
};

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies((data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const openCreate = () => {
    const nextOrder = companies.length ? Math.max(...companies.map((c) => c.displayOrder || 0)) + 1 : 1;
    setEditing(null);
    setForm({ ...EMPTY, displayOrder: nextOrder });
    setIsModalOpen(true);
  };

  const openEdit = (c: CompanyProfile) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      role: c.role || "",
      location: c.location || "",
      startDate: c.startDate || "",
      endDate: c.endDate || "",
      description: c.description || "",
      website: c.website || "",
      logo: c.logo || "",
      displayOrder: c.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const setField = (key: string, value: string | number) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      showToast("Logo must be under 5 MB.", "error");
      return;
    }
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "logos", `logo-${Date.now()}-${file.name}`);
      setField("logo", url);
      showToast("Logo uploaded.");
    } catch (err) {
      showToast("Logo upload failed.", "error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      showToast("Company name and your role are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        displayOrder: Number(form.displayOrder) || 1,
      };
      if (editing) {
        const updated = await updateCompany(editing.id, payload);
        setCompanies((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        showToast("Company updated.");
      } else {
        const created = await createCompany(payload);
        setCompanies((prev) => [...prev, created]);
        showToast("Company added.");
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save company.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      showToast("Company deleted.");
    } catch (err) {
      showToast("Failed to delete company.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div id="admin-companies-root" className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">Company Master</h2>
          <p className="text-xs text-text-secondary mt-1">
            Add the companies you've worked at. Experiences link to a company and group under it on the Work page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Company</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {companies.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <Building2 size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No companies yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Add your first company, then link your experiences to it in the entry form.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {companies.map((c) => {
            const isDeleting = deletingId === c.id;
            return (
              <div
                key={c.id}
                className="p-6 bg-surface border border-border rounded-2xl hover:border-accent/40 transition-all duration-200 flex flex-col md:flex-row gap-4 justify-between items-start"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 overflow-hidden">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={16} />
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{c.name}</h4>
                      <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">{c.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-mono font-bold text-text-secondary uppercase tracking-wider pt-1">
                    {(c.startDate || c.endDate) && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-accent" />
                        {c.startDate} {c.endDate ? `— ${c.endDate}` : ""}
                      </span>
                    )}
                    {c.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} className="text-accent" />
                        {c.location}
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-xs text-text-secondary leading-relaxed font-medium pt-1">{c.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-2 border border-border bg-background hover:border-accent/40 text-text-secondary hover:text-text-primary rounded-xl cursor-pointer transition-colors"
                    title="Edit company"
                  >
                    <Edit2 size={13} />
                  </button>
                  {isDeleting ? (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(c.id)}
                        className="px-2 py-1 bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shrink-0 hover:bg-red-600"
                      >
                        Trash
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 text-text-secondary hover:text-text-primary text-[9px] font-bold uppercase tracking-wider"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(c.id)}
                      className="p-2 border border-border bg-background hover:border-red-500 hover:bg-red-500/5 text-text-secondary hover:text-red-500 rounded-xl cursor-pointer transition-colors"
                      title="Delete company"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editing ? "Edit Company" : "Add Company"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company Name *" value={form.name} onChange={(v) => setField("name", v)} placeholder="e.g. Revalsys Technologies" />
                <Field label="Your Role *" value={form.role} onChange={(v) => setField("role", v)} placeholder="e.g. .NET Developer & Team Lead" />
                <Field label="Join Date" value={form.startDate} onChange={(v) => setField("startDate", v)} placeholder="e.g. Feb 2023" />
                <Field label="End Date" value={form.endDate} onChange={(v) => setField("endDate", v)} placeholder="e.g. Present" />
                <Field label="Location / Address" value={form.location} onChange={(v) => setField("location", v)} placeholder="e.g. Hyderabad, India" />
                <Field label="Website" value={form.website} onChange={(v) => setField("website", v)} placeholder="https://…" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setField("displayOrder", Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo uploader (media API) with URL fallback */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Company Logo</label>
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden text-text-secondary shrink-0">
                    {form.logo ? (
                      <img src={form.logo} alt="Company logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-background border border-border hover:border-accent text-text-primary hover:text-accent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={13} />
                      <span>{uploadingLogo ? "Uploading…" : form.logo ? "Replace" : "Upload logo"}</span>
                    </button>
                    {form.logo && (
                      <button
                        type="button"
                        onClick={() => setField("logo", "")}
                        className="px-3 py-2.5 border border-border hover:border-red-500 hover:text-red-500 text-text-secondary rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleLogoFile}
                    aria-label="Upload company logo"
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={form.logo}
                  onChange={(e) => setField("logo", e.target.value)}
                  placeholder="…or paste a logo URL (optional)"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-xs font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Short blurb about the company / your tenure…"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 font-mono font-bold text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-border hover:border-red-500 hover:bg-red-500/5 text-text-secondary hover:text-red-500 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-text-primary text-background hover:bg-accent hover:text-white rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Commit Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
    />
  </div>
);
