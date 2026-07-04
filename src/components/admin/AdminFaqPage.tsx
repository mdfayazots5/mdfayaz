import React, { useEffect, useState } from "react";
import { getFaqItems, createFaqItem, updateFaqItem, deleteFaqItem } from "../../services/api";
import { FaqItem } from "../../models/portfolio.model";
import { Plus, Edit2, Trash2, HelpCircle, X } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";
import { PublishToggle } from "./PublishToggle";

export const AdminFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingProgress, setDeletingProgress] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await getFaqItems();
      setFaqs(data || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const uniqueCategories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    // Default to the first category if exists, otherwise empty
    if (uniqueCategories.length > 0) {
      setCategory(uniqueCategories[0]);
      setIsCustomCategory(false);
    } else {
      setCategory("__new__");
      setIsCustomCategory(true);
    }
    setCustomCategory("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setIsCustomCategory(false);
    setCustomCategory("");
    setIsModalOpen(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (val === "__new__") {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setMessage({ text: "Please enter both a question and an answer.", type: "error" });
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      setMessage({ text: "Please select or type a valid category.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: finalCategory
      };

      if (editingFaq) {
        const updated = await updateFaqItem(editingFaq.id, payload);
        if (updated) {
          setFaqs(prev => prev.map(f => f.id === editingFaq.id ? updated : f));
          setMessage({ text: "FAQ successfully updated.", type: "success" });
        } else {
          throw new Error("Update returned null");
        }
      } else {
        const created = await createFaqItem(payload);
        if (created) {
          setFaqs(prev => [...prev, created]);
          setMessage({ text: "FAQ successfully created.", type: "success" });
        } else {
          throw new Error("Creation returned null");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save FAQ failure:", err);
      setMessage({ text: "Error encountered while syncing FAQ item.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleTogglePublish = async (faq: FaqItem) => {
    const next = faq.published === false;
    setTogglingId(faq.id);
    setMessage(null);
    try {
      await updateFaqItem(faq.id, { ...faq, published: next });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, published: next } : f)));
      setMessage({
        text: next ? "FAQ published — now visible on the portal." : "FAQ unpublished — hidden from the portal.",
        type: "success",
      });
    } catch (err) {
      setMessage({ text: "Failed to update publish state.", type: "error" });
    } finally {
      setTogglingId(null);
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
      const success = await deleteFaqItem(id);
      if (success) {
        setFaqs(prev => prev.filter(f => f.id !== id));
        setMessage({ text: "FAQ item permanently deleted.", type: "success" });
      } else {
        setMessage({ text: "Failed to delete FAQ item.", type: "error" });
      }
    } catch (err) {
      console.error("Delete FAQ failure:", err);
      setMessage({ text: "Error connecting to service.", type: "error" });
    } finally {
      setDeletingProgress(false);
      setDeletingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const filteredFaqs = faqs;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="admin-faq-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">FAQ Registry</h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure answers to frequently asked developer interview and domain questions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-new-faq-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {message && (
        <div 
          id="faq-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FAQ list Grid / Blocks */}
      {filteredFaqs.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <HelpCircle size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No FAQs matched</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              There are no available FAQ items for this category description.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredFaqs.map((faq) => {
            const isDeleting = deletingId === faq.id;
            return (
              <div 
                key={faq.id}
                id={`faq-row-${faq.id}`}
                className="p-6 bg-surface border border-border rounded-2xl hover:border-accent/40 transition-all duration-200 flex flex-col md:flex-row gap-4 justify-between items-start"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary">FAQ #{faq.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">
                    {faq.question}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <PublishToggle
                    published={faq.published !== false}
                    busy={togglingId === faq.id}
                    onToggle={() => handleTogglePublish(faq)}
                  />
                  <button
                    id={`edit-faq-${faq.id}`}
                    onClick={() => handleOpenEditModal(faq)}
                    className="p-2 border border-border bg-background hover:border-accent/40 text-text-secondary hover:text-text-primary rounded-xl cursor-pointer transition-colors"
                    title="Edit FAQ content"
                  >
                    <Edit2 size={13} />
                  </button>
                  {isDeleting ? (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 p-1 rounded-xl">
                      <button
                        id={`confirm-del-faq-${faq.id}`}
                        onClick={() => handleConfirmDelete(faq.id)}
                        disabled={deletingProgress}
                        className="px-2 py-1 bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shrink-0 hover:bg-red-600 disabled:opacity-50"
                      >
                        Trash
                      </button>
                      <button
                        id={`cancel-del-faq-${faq.id}`}
                        onClick={handleCancelDelete}
                        className="px-2 py-1 text-text-secondary hover:text-text-primary text-[9px] font-bold uppercase tracking-wider"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`trigger-del-faq-${faq.id}`}
                      onClick={() => handleTriggerDelete(faq.id)}
                      className="p-2 border border-border bg-background hover:border-red-500 hover:bg-red-500/5 text-text-secondary hover:text-red-500 rounded-xl cursor-pointer transition-colors"
                      title="Delete FAQ"
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

      {/* Creation/Edit Dialog Modal Component */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div 
            id="faq-modal-container"
            className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editingFaq ? "Edit FAQ Item" : "Create New FAQ"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Category</label>
                <select
                  id="faq-category-select"
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none cursor-pointer"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">+ Write Custom Category...</option>
                </select>
              </div>

              {isCustomCategory && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-accent">Custom Category Name</label>
                  <input
                    id="faq-custom-category-input"
                    type="text"
                    required
                    placeholder="e.g. SYSTEMS, DATABASES"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">The Question</label>
                <textarea
                  id="faq-question-textarea"
                  rows={2}
                  required
                  placeholder="Identify your core question title..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">The Answer</label>
                <textarea
                  id="faq-answer-textarea"
                  rows={4}
                  required
                  placeholder="State the technical explanation concisely..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
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
