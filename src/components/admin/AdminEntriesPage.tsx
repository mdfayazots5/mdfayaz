import React, { useEffect, useState } from "react";
import { getEntries, deleteEntry, updateEntry } from "../../services/api";
import { Entry } from "../../models/portfolio.model";
import { Plus, Edit2, Trash2, Calendar, Briefcase, Layers, Code, CheckCircle, HelpCircle } from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";
import { PublishToggle } from "./PublishToggle";

export const AdminEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"company" | "personal">("company");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingProgress, setDeletingProgress] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await getEntries();
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to fetch entries list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

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
      const success = await deleteEntry(id);
      if (success) {
        setEntries(prev => prev.filter(e => e.id !== id));
        setMessage({ text: "Portfolio entry successfully deleted.", type: "success" });
      } else {
        setMessage({ text: "Failed to delete entry due to system error.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "CORS or connection failure while deleting.", type: "error" });
    } finally {
      setDeletingProgress(false);
      setDeletingId(null);
      
      setTimeout(() => {
        setMessage(null);
      }, 4000);
    }
  };

  const handleTogglePublish = async (entry: Entry) => {
    const next = entry.published === false; // currently draft → publish, else → draft
    setTogglingId(entry.id);
    setMessage(null);
    try {
      await updateEntry(entry.id, { ...entry, published: next });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, published: next } : e)));
      setMessage({
        text: next ? "Entry published — now visible on the portal." : "Entry unpublished — hidden from the portal.",
        type: "success",
      });
    } catch (err) {
      setMessage({ text: "Failed to update publish state.", type: "error" });
    } finally {
      setTogglingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredEntries = entries.filter((entry) => entry.type === activeTab);

  return (
    <div id="admin-entries-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">Unified Portfolio Registry</h2>
          <p className="text-xs text-text-secondary mt-1">
            Browse, manage, or edit professional work experience nodes and personal side products
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
          <a
            id="admin-new-entry-btn"
            href="#admin/entries/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Entry</span>
          </a>
        </div>
      </div>

      {message && (
        <div 
          id="entries-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Essential segment switcher */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface border border-border p-3.5 rounded-2xl">
        <div className="flex bg-background p-1 rounded-xl border border-border/60 select-none w-full md:w-auto" id="admin-segment-selector">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "company"
                ? "bg-surface text-text-primary shadow-sm border border-border/45"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
            }`}
          >
            🏢 Company Work
          </button>
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "personal"
                ? "bg-surface text-text-primary shadow-sm border border-border/45"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
            }`}
          >
            🛠️ Personal Products
          </button>
        </div>

        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary px-3">
          Showing {filteredEntries.length} {activeTab === "company" ? "experience" : "project"} entries
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <Layers size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No Entries Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              No entries are available in this section yet. Add one when you are ready to publish it.
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
                  <th className="px-6 py-4.5">Project Information</th>
                  {activeTab === "company" ? (
                    <>
                      <th className="px-6 py-4.5">Role & Domain</th>
                      <th className="px-6 py-4.5">Active Timeline</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4.5">Audience & Status</th>
                      <th className="px-6 py-4.5">Details Link</th>
                    </>
                  )}
                  <th className="px-6 py-4.5 text-right w-44">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEntries.map((entry) => {
                  const isDeleting = deletingId === entry.id;
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className="hover:bg-background/25 transition-colors text-xs font-medium"
                      id={`row-entry-${entry.id}`}
                    >
                      {/* Name, Icon, category tag */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <span 
                            className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center text-lg shadow-inner shrink-0 text-accent font-bold"
                          >
                            {activeTab === "company" ? "🏢" : "⚙️"}
                          </span>
                          <div className="space-y-1 text-left">
                            <span className="font-bold text-text-primary hover:text-accent transition-colors block leading-tight">
                              {entry.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest bg-background border border-border px-1.5 py-0.5 rounded-md">
                                {entry.categoryTag}
                              </span>
                              {entry.companyName && (
                                <span className="text-[9px] font-mono font-bold text-text-secondary uppercase">
                                  @ {entry.companyName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {activeTab === "company" ? (
                        <>
                          {/* Role & Domain */}
                          <td className="px-6 py-5 text-text-secondary">
                            <div className="space-y-1 text-left">
                              <span className="font-bold text-text-primary inline-flex items-center gap-1.5">
                                <Briefcase size={12} className="text-text-secondary" />
                                {entry.role}
                              </span>
                              {entry.teamSize !== undefined && (
                                <span className="text-[10px] block text-text-secondary">
                                  Team Size: {entry.teamSize} members
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Active Timeline */}
                          <td className="px-6 py-5 text-text-secondary pt-6">
                            <div className="inline-flex items-center gap-1.5 font-mono">
                              <Calendar size={12} className="text-text-secondary" />
                              <span>{entry.startDate} — {entry.endDate}</span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Audience & Status */}
                          <td className="px-6 py-5 text-text-secondary">
                            <div className="space-y-1 text-left">
                              <span className="font-bold text-text-primary">
                                Status: {entry.status}
                              </span>
                              <span className="text-[11px] block text-text-secondary">
                                For: {entry.audience || "General Segment"}
                              </span>
                            </div>
                          </td>

                          {/* Details Link */}
                          <td className="px-6 py-5 text-text-secondary">
                            <div className="font-mono text-[11px] max-w-xs truncate" title={entry.liveUrl}>
                              {entry.liveUrl ? (
                                <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                                  <span>{entry.liveUrl}</span>
                                </a>
                              ) : (
                                "No link defined"
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Operations buttons */}
                      <td className="px-6 py-5 text-right">
                        {isDeleting ? (
                          <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-red-500 animate-pulse mr-1">Sure?</span>
                            <button
                              id={`confirm-del-${entry.id}`}
                              onClick={() => handleConfirmDelete(entry.id)}
                              disabled={deletingProgress}
                              className="px-2.5 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg cursor-pointer transition-colors disabled:opacity-50 animate-pulse"
                            >
                              Yes
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              disabled={deletingProgress}
                              className="px-2.5 py-1.5 bg-background border border-border text-text-primary hover:bg-surface rounded-lg cursor-pointer transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <PublishToggle
                              published={entry.published !== false}
                              busy={togglingId === entry.id}
                              onToggle={() => handleTogglePublish(entry)}
                            />
                            <a
                              id={`edit-entry-${entry.id}`}
                              href={`#admin/entries/${entry.id}/edit`}
                              className="p-2 border border-border hover:border-accent bg-background text-text-secondary hover:text-accent rounded-lg cursor-pointer transition-colors"
                              title="Edit specifications"
                            >
                              <Edit2 size={13} />
                            </a>
                            <button
                              id={`trigger-del-${entry.id}`}
                              onClick={() => handleTriggerDelete(entry.id)}
                              className="p-2 border border-border hover:border-red-500/40 bg-background text-text-secondary hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                              title="Delete entry"
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

          {/* Mobile responsive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
            {filteredEntries.map((entry) => {
              const isDeleting = deletingId === entry.id;

              return (
                <div 
                  key={entry.id} 
                  className="p-6 bg-surface border border-border rounded-2xl flex flex-col justify-between gap-5 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4.5 border-b border-border pb-4">
                      <span className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 shrink-0 flex items-center justify-center text-accent text-lg font-bold">
                        {entry.type === "company" ? "🏢" : "⚙️"}
                      </span>
                      <div className="space-y-1">
                        <h3 className="font-bold text-text-primary text-sm leading-tight">
                          {entry.title}
                        </h3>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded inline-block bg-background border border-border text-text-secondary">
                          {entry.categoryTag}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-xs text-text-secondary">
                      {entry.type === "company" ? (
                        <>
                          <li className="flex items-center gap-2">
                            <Briefcase size={12} />
                            <span className="font-bold text-text-primary">{entry.role}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span className="font-mono">{entry.startDate} — {entry.endDate}</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-accent" />
                            <span className="font-bold text-text-primary">Status: {entry.status}</span>
                          </li>
                          {entry.liveUrl && (
                            <li className="flex items-center gap-2 max-w-[200px] truncate">
                              <Code size={12} />
                              <span className="font-mono text-[10px] text-accent font-bold truncate">{entry.liveUrl}</span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    {isDeleting ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-red-500 animate-pulse mr-1">Confirm delete?</span>
                        <button
                          onClick={() => handleConfirmDelete(entry.id)}
                          disabled={deletingProgress}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer"
                        >
                          Yes
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
                          published={entry.published !== false}
                          busy={togglingId === entry.id}
                          onToggle={() => handleTogglePublish(entry)}
                        />
                        <a
                          href={`#admin/entries/${entry.id}/edit`}
                          className="flex-1 py-2.5 border border-border hover:border-accent bg-background text-text-primary text-center hover:text-accent font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Edit Item
                        </a>
                        <button
                          onClick={() => handleTriggerDelete(entry.id)}
                          className="p-2.5 border border-border hover:border-red-500/55 hover:bg-red-500/5 bg-background text-text-secondary hover:text-red-500 rounded-xl cursor-pointer"
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

    </div>
  );
};
