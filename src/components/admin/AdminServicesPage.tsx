import React, { useEffect, useState } from "react";
import { getServices, createService, updateService, deleteService } from "../../services/api";
import { Service } from "../../models/portfolio.model";
import { Plus, Edit2, Trash2, X, Layers, ListPlus, ArrowUpDown } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";
import { PublishToggle } from "./PublishToggle";

// Common clean lucide icon list for portfolio selection
const AVAILABLE_ICONS = ["Server", "Code", "Database", "Globe", "Layers", "Cpu", "Shield", "Terminal", "AppWindow", "Activity", "Briefcase", "Sparkles", "TrendingUp", "Zap"];

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingProgress, setDeletingProgress] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form / Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Server");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [highlights, setHighlights] = useState<string[]>([""]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to fetch services list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreateModal = () => {
    // Find next order index to prefill displayOrder automatically
    const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.displayOrder || 0)) + 1 : 1;
    
    setEditingService(null);
    setName("");
    setTagline("");
    setDescription("");
    setIcon("Server");
    setStatus("Active");
    setDisplayOrder(nextOrder);
    setHighlights([""]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setTagline(service.tagline);
    setDescription(service.description);
    setIcon(service.icon);
    setStatus(service.status);
    setDisplayOrder(service.displayOrder);
    setHighlights(service.highlights && service.highlights.length > 0 ? [...service.highlights] : [""]);
    setIsModalOpen(true);
  };

  const handleAddHighlightField = () => {
    setHighlights(prev => [...prev, ""]);
  };

  const handleRemoveHighlightField = (index: number) => {
    if (highlights.length === 1) {
      setHighlights([""]);
      return;
    }
    setHighlights(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleHighlightValueChange = (index: number, val: string) => {
    setHighlights(prev => {
      const copied = [...prev];
      copied[index] = val;
      return copied;
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim() || !description.trim()) {
      setMessage({ text: "Please fill out all required service fields.", type: "error" });
      return;
    }

    // Clean blank highlights
    const cleanHighlights = highlights.map(h => h.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        icon,
        status,
        displayOrder,
        highlights: cleanHighlights
      };

      if (editingService) {
        const updated = await updateService(editingService.id, payload);
        if (updated) {
          setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
          setMessage({ text: "Consulting service successfully updated.", type: "success" });
        } else {
          throw new Error("Update service returned null");
        }
      } else {
        const created = await createService(payload);
        if (created) {
          setServices(prev => [...prev, created]);
          setMessage({ text: "New service successfully spawned in registry.", type: "success" });
        } else {
          throw new Error("Create service returned null");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save service error:", err);
      setMessage({ text: "Error encountered while syncing service metadata.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleTriggerDelete = (id: number) => {
    setDeletingId(id);
    setMessage(null);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = async (id: number) => {
    setDeletingProgress(true);
    try {
      const success = await deleteService(id);
      if (success) {
        setServices(prev => prev.filter(s => s.id !== id));
        setMessage({ text: "Service offering successfully purged.", type: "success" });
      } else {
        setMessage({ text: "Failed to delete service. Error returned.", type: "error" });
      }
    } catch (err) {
      console.error("Delete service connection error:", err);
      setMessage({ text: "CORS error or API connection failure.", type: "error" });
    } finally {
      setDeletingProgress(false);
      setDeletingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // For Services, "Active" IS the published state on the portal.
  const handleTogglePublish = async (service: Service) => {
    const nextStatus: "Active" | "Inactive" = service.status === "Active" ? "Inactive" : "Active";
    setTogglingId(service.id);
    setMessage(null);
    try {
      await updateService(service.id, { ...service, status: nextStatus });
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, status: nextStatus } : s)));
      setMessage({
        text: nextStatus === "Active" ? "Service published to the portal." : "Service unpublished — hidden from the portal.",
        type: "success",
      });
    } catch (err) {
      setMessage({ text: "Failed to update publish state.", type: "error" });
    } finally {
      setTogglingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Sort services: Active first, then inactive, secondary sort on displayOrder ascending
  const sortedServices = [...services].sort((a, b) => {
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (a.status !== "Active" && b.status === "Active") return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  const filteredServices = sortedServices;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="admin-services-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">Services Administration</h2>
          <p className="text-xs text-text-secondary mt-1">
            Browse, manage, and edit professional software consulting services, display orders, and live badges
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            id="admin-new-service-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {message && (
        <div 
          id="services-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Sort summary */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border/70 rounded-xl select-none text-[10px] uppercase font-mono font-bold text-text-secondary">
          <ArrowUpDown size={11} />
          <span>Priority sorted: Active offerings first</span>
        </div>

        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary px-3">
          Showing {filteredServices.length} service offerings
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <Layers size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No services registered</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Ready to showcase your deliverables? Tap "Add Service" to seed consulting blocks.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary select-none">
                  <th className="px-6 py-4.5">Service Detail</th>
                  <th className="px-6 py-4.5">Status Badge</th>
                  <th className="px-6 py-4.5">Sorting index</th>
                  <th className="px-6 py-4.5">Highlights Count</th>
                  <th className="px-6 py-4.5 text-right w-40">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredServices.map((service) => {
                  const isDeleting = deletingId === service.id;
                  
                  return (
                    <tr 
                      key={service.id} 
                      className="hover:bg-background/25 transition-colors text-xs font-medium"
                      id={`service-row-${service.id}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent text-sm shrink-0">
                            ⚙️
                          </span>
                          <div className="space-y-1 text-left">
                            <span className="font-bold text-text-primary block leading-tight">
                              {service.name}
                            </span>
                            <span className="text-[10px] text-text-secondary block font-mono max-w-sm truncate" title={service.tagline}>
                              {service.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border rounded-lg ${
                          service.status === 'Active' 
                            ? 'bg-accent/10 border-accent/20 text-accent' 
                            : 'bg-text-secondary/10 border-border text-text-secondary'
                        }`}>
                          {service.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-mono text-text-primary text-sm font-semibold">
                        {service.displayOrder}
                      </td>

                      <td className="px-6 py-5 text-text-secondary font-mono">
                        {service.highlights ? service.highlights.length : 0} item(s)
                      </td>

                      <td className="px-6 py-5 text-right">
                        {isDeleting ? (
                          <div className="flex items-center justify-end gap-1.5 scroll-none">
                            <span className="text-red-500 font-bold text-[9px] uppercase tracking-wider animate-pulse mr-1">Purge?</span>
                            <button
                              id={`confirm-del-serv-${service.id}`}
                              onClick={() => handleConfirmDelete(service.id)}
                              disabled={deletingProgress}
                              className="px-2 py-1 bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider h-8 hover:bg-red-600 cursor-pointer disabled:opacity-50"
                            >
                              purge
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              disabled={deletingProgress}
                              className="px-2 py-1 bg-background text-text-primary border border-border rounded-lg text-[9px] font-bold uppercase tracking-wider h-8 hover:bg-surface cursor-pointer"
                            >
                              keep
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <PublishToggle
                              published={service.status === "Active"}
                              busy={togglingId === service.id}
                              onToggle={() => handleTogglePublish(service)}
                            />
                            <button
                              id={`edit-serv-${service.id}`}
                              onClick={() => handleOpenEditModal(service)}
                              className="p-2 border border-border hover:border-accent bg-background text-text-secondary hover:text-accent rounded-lg cursor-pointer transition-colors"
                              title="Edit service specifications"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              id={`trigger-del-serv-${service.id}`}
                              onClick={() => handleTriggerDelete(service.id)}
                              className="p-2 border border-border hover:border-red-500 bg-background text-text-secondary hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                              title="purge service"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile listing layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
            {filteredServices.map((service) => {
              const isDeleting = deletingId === service.id;

              return (
                <div 
                  key={service.id} 
                  className="p-6 bg-surface border border-border rounded-2xl flex flex-col justify-between gap-5 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 shrink-0 flex items-center justify-center text-accent text-lg font-bold">
                          💼
                        </span>
                        <div>
                          <h3 className="font-bold text-text-primary text-sm leading-tight">{service.name}</h3>
                          <span className="text-[9px] text-text-secondary font-mono">Display Index: {service.displayOrder}</span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider rounded border ${
                        service.status === 'Active' 
                          ? 'bg-accent/10 border-accent/20 text-accent' 
                          : 'bg-text-secondary/15 border-border text-text-secondary'
                      }`}>
                        {service.status}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {service.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    {isDeleting ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-red-500 animate-pulse mr-1">Purge?</span>
                        <button
                          onClick={() => handleConfirmDelete(service.id)}
                          disabled={deletingProgress}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer"
                        >
                          Purge
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          disabled={deletingProgress}
                          className="px-3 py-1.5 bg-background border border-border text-text-primary rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <PublishToggle
                          published={service.status === "Active"}
                          busy={togglingId === service.id}
                          onToggle={() => handleTogglePublish(service)}
                        />
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="flex-1 py-2.5 border border-border hover:border-accent bg-background text-text-primary text-center hover:text-accent font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleTriggerDelete(service.id)}
                          className="p-2.5 border border-border hover:border-red-500 hover:bg-red-500/5 bg-background text-text-secondary hover:text-red-500 rounded-xl cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Detail Modals for Creation / Updating Offerings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in select-none">
          <div 
            id="service-modal-container"
            className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-xl space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editingService ? "Update Services Offer" : "Spawn New Consulting Area"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Service Name *</label>
                  <input
                    id="service-name-input"
                    type="text"
                    required
                    placeholder="e.g. ASP.NET Core API Development"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Display order *</label>
                  <input
                    id="service-displayOrder-input"
                    type="number"
                    required
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Short tagline * (One or two lines showcasing benefits)</label>
                <input
                  id="service-tagline-input"
                  type="text"
                  required
                  placeholder="e.g. Designing secure high-performance HTTP endpoints..."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Full description * (Deeper details for overlay modal)</label>
                <textarea
                  id="service-description-textarea"
                  rows={3}
                  required
                  placeholder="Explain details, methodologies, integration benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Visual theme Icon</label>
                  <select
                    id="service-icon-select"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none cursor-pointer"
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Status Badge</label>
                  <div className="flex bg-background rounded-xl p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => setStatus("Active")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        status === "Active" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Inactive")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                        status === "Inactive" ? "bg-text-secondary text-background" : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Highlights inputs section */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Specialist Highlights (2-4 bullets)</label>
                  <button
                    type="button"
                    onClick={handleAddHighlightField}
                    className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-accent uppercase tracking-wider hover:text-accent/80 transition-colors"
                  >
                    <ListPlus size={11} />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                  {highlights.map((highlight, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono font-bold text-text-secondary">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="e.g. Microservices architecture setup with Docker"
                        value={highlight}
                        onChange={(e) => handleHighlightValueChange(idx, e.target.value)}
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-medium focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlightField(idx)}
                        className="p-2 border border-border hover:border-red-500 rounded-lg hover:text-red-500 text-text-secondary"
                        title="Remove highlight point"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border flex justify-end gap-3 font-mono font-bold text-[10px] uppercase tracking-wider select-none">
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
