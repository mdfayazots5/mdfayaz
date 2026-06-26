import React, { useEffect, useState } from "react";
import { 
  getPrivacySections, 
  createPrivacySection, 
  updatePrivacySection, 
  deletePrivacySection,
  reorderPrivacySections
} from "../../services/api";
import { PrivacySection } from "../../models/portfolio.model";
import { Plus, Edit2, Trash2, Shield, RefreshCw, ChevronUp, ChevronDown, X } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";

export const AdminPrivacyPage: React.FC = () => {
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal operations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PrivacySection | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Deletion purgatory lock
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await getPrivacySections();
      setSections(data || []);
    } catch (err) {
      console.error("Failed to load privacy sections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingSection(null);
    setTitle("");
    setBody("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sec: PrivacySection) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setBody(sec.body);
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim()
      };

      if (editingSection) {
        const updated = await updatePrivacySection(editingSection.id, payload);
        if (updated) {
          setSections(prev => prev.map(s => s.id === editingSection.id ? updated : s));
          showToast("Privacy section successfully updated.");
        }
      } else {
        const created = await createPrivacySection(payload);
        if (created) {
          setSections(prev => [...prev, created]);
          showToast("New privacy section created.");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Error synchronizing privacy clause details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const success = await deletePrivacySection(id);
      if (success) {
        setSections(prev => prev.filter(s => s.id !== id));
        showToast("Privacy section permanently deleted.");
      } else {
        showToast("Failed to delete section.", "error");
      }
    } catch (err) {
      showToast("Error deleting privacy section.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ORDER SWAPPING MECHANICS (UP / DOWN)
  const moveSection = async (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const newList = [...sections];
    // swap
    const temp = newList[index];
    newList[index] = newList[newIdx];
    newList[newIdx] = temp;

    // Save in memory state first
    setSections(newList);

    try {
      const orderedIds = newList.map(s => s.id);
      const success = await reorderPrivacySections(orderedIds);
      if (success) {
        showToast("Privacy clauses reordered successfully.");
      } else {
        showToast("Failed to save reordered positions.", "error");
      }
    } catch (err) {
      showToast("Connection/reorder failure.", "error");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="admin-privacy-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">Privacy Clauses</h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure site privacy statements, terms, copyright and data ownership guidelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSections}
            className="p-3 border border-border bg-surface hover:text-accent rounded-xl cursor-pointer hover:border-accent"
            title="Refresh database"
          >
            <RefreshCw size={14} />
          </button>
          
          <button
            id="admin-new-privacy-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {message && (
        <div 
          id="privacy-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center transition-all ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Clauses list */}
      {sections.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <Shield size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No sections formatted</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              There are no copyright or policy clauses set up. Hit the button to write your first legal block.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((sec, idx) => {
            const isDeleting = deletingId === sec.id;

            return (
              <div 
                key={sec.id}
                id={`privacy-block-${sec.id}`}
                className="p-6 bg-surface border border-border rounded-2xl hover:border-accent/40 transition-all duration-200 flex flex-col md:flex-row gap-5 justify-between items-start"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono font-bold text-accent bg-accent/10 py-1 px-2.5 rounded uppercase tracking-wider">
                      Position {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary">[{sec.id}]</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">{sec.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-wrap">{sec.body}</p>
                </div>

                {/* Operations side panel */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  
                  {/* Sorting arrows */}
                  <div className="flex items-center gap-0.5 border-r border-border pr-2">
                    <button
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 hover:bg-background rounded-lg border border-border/40 hover:border-accent/40 disabled:opacity-30 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 hover:bg-background rounded-lg border border-border/40 hover:border-accent/40 disabled:opacity-30 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  <button
                    id={`edit-priv-${sec.id}`}
                    onClick={() => handleOpenEditModal(sec)}
                    className="p-2 border border-border bg-background hover:border-accent/40 text-text-secondary hover:text-text-primary rounded-xl cursor-pointer transition-colors"
                    title="Edit Clause Content"
                  >
                    <Edit2 size={13} />
                  </button>

                  {isDeleting ? (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 p-1 rounded-xl">
                      <button
                        id={`confirm-del-priv-${sec.id}`}
                        onClick={() => handleConfirmDelete(sec.id)}
                        className="px-2 py-1 bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shrink-0 hover:bg-red-600"
                      >
                        Trash
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 text-text-secondary hover:text-text-primary text-[9px] font-bold uppercase tracking-wider"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`trigger-del-priv-${sec.id}`}
                      onClick={() => setDeletingId(sec.id)}
                      className="p-2 border border-border bg-background hover:border-red-500 hover:bg-red-500/5 text-text-secondary hover:text-red-500 rounded-xl cursor-pointer transition-colors"
                      title="Delete Clause"
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

      {/* Clause Add/Edit Modal Dialoug */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div 
            id="privacy-modal-container"
            className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editingSection ? "Edit Policy Segment" : "New Privacy Clause"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Clause / Section Title</label>
                <input
                  id="privacy-title-input"
                  type="text"
                  required
                  placeholder="e.g. 1. DATA OWNERSHIP & SECURITY"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Body Content</label>
                <textarea
                  id="privacy-body-textarea"
                  rows={8}
                  required
                  placeholder="Insert legal, system-agnostic policies or terms statements here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
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
