import React, { useEffect, useState } from "react";
import { 
  getUsesCategories, 
  createUsesCategory, 
  updateUsesCategory, 
  deleteUsesCategory,
  createUsesItem,
  updateUsesItem,
  deleteUsesItem
} from "../../services/api";
import { UsesCategory, UsesItem } from "../../models/portfolio.model";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Wrench, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  X, 
  ChevronRight, 
  Layers, 
  PlusCircle, 
  CheckCircle,
  Tag
} from "lucide-react";
import { LoadingScreen } from "../LoadingScreen";

export const AdminUsesPage: React.FC = () => {
  const [categories, setCategories] = useState<UsesCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<UsesCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catSubtitle, setCatSubtitle] = useState("");

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemTargetCatId, setItemTargetCatId] = useState<string>("");
  const [editingItem, setEditingItem] = useState<UsesItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemTag, setItemTag] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Deletion locks
  const [purgatoryCatId, setPurgatoryCatId] = useState<string | null>(null);
  const [purgatoryItemId, setPurgatoryItemId] = useState<{ catId: string; itemID: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getUsesCategories();
      setCategories(data || []);
      // Expand all categories by default for easier editing
      const initialExpanded: Record<string, boolean> = {};
      (data || []).forEach(cat => {
        initialExpanded[cat.id] = true;
      });
      setExpandedCats(initialExpanded);
    } catch (err) {
      console.error("Failed to load uses categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // PERSIST CURRENT FULL STATE (For Up/Down category and item swaps)
  const persistCategoriesState = async (newList: UsesCategory[]) => {
    setCategories(newList);
  };

  // CATEGORY OPERATIONS
  const handleOpenCreateCat = () => {
    setEditingCat(null);
    setCatName("");
    setCatSubtitle("");
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: UsesCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSubtitle(cat.subtitle || "");
    setIsCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: catName.trim(),
        subtitle: catSubtitle.trim() || undefined
      };

      if (editingCat) {
        const updated = await updateUsesCategory(editingCat.id, payload);
        if (updated) {
          const updatedCategories = categories.map(c => c.id === editingCat.id ? { ...c, ...updated } : c);
          await persistCategoriesState(updatedCategories);
          showToast("Category metadata updated.");
        }
      } else {
        const created = await createUsesCategory(payload);
        if (created) {
          const updatedCategories = [...categories, created];
          await persistCategoriesState(updatedCategories);
          showToast("New category created.");
          setExpandedCats(prev => ({ ...prev, [created.id]: true }));
        }
      }
      setIsCatModalOpen(false);
    } catch (err) {
      showToast("Error saving uses category.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteCat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await deleteUsesCategory(id);
      if (success) {
        const filtered = categories.filter(c => c.id !== id);
        await persistCategoriesState(filtered);
        showToast("Category permanently removed.");
      } else {
        showToast("Failed to delete category.", "error");
      }
    } catch (err) {
      showToast("Error deleting category.", "error");
    } finally {
      setPurgatoryCatId(null);
    }
  };

  // ITEM OPERATIONS
  const handleOpenCreateItem = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemTargetCatId(catId);
    setEditingItem(null);
    setItemName("");
    setItemDescription("");
    setItemTag("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (catId: string, item: UsesItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemTargetCatId(catId);
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemTag(item.tag || "");
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemDescription.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: itemName.trim(),
        description: itemDescription.trim(),
        tag: itemTag.trim() || undefined
      };

      if (editingItem) {
        const updated = await updateUsesItem(itemTargetCatId, editingItem.id, payload);
        if (updated) {
          const updatedCategories = categories.map(c => {
            if (c.id === itemTargetCatId) {
              return {
                ...c,
                items: c.items.map(i => i.id === editingItem.id ? { ...i, ...updated } : i)
              };
            }
            return c;
          });
          await persistCategoriesState(updatedCategories);
          showToast("Item successfully updated.");
        }
      } else {
        const created = await createUsesItem(itemTargetCatId, payload);
        if (created) {
          const updatedCategories = categories.map(c => {
            if (c.id === itemTargetCatId) {
              return {
                ...c,
                items: [...(c.items || []), created]
              };
            }
            return c;
          });
          await persistCategoriesState(updatedCategories);
          showToast("New item appended to category.");
        }
      }
      setIsItemModalOpen(false);
    } catch (err) {
      showToast("Error saving item.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteItem = async (catId: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await deleteUsesItem(catId, itemId);
      if (success) {
        const updatedCategories = categories.map(c => {
          if (c.id === catId) {
            return {
              ...c,
              items: c.items.filter(i => i.id !== itemId)
            };
          }
          return c;
        });
        await persistCategoriesState(updatedCategories);
        showToast("Item permanently removed.");
      } else {
        showToast("Failed to delete item.", "error");
      }
    } catch (err) {
      showToast("Error deleting item.", "error");
    } finally {
      setPurgatoryItemId(null);
    }
  };

  // ORDER SWAPPING MECHANICS (UP / DOWN)
  const moveCategory = async (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newList = [...categories];
    // swap
    const temp = newList[index];
    newList[index] = newList[newIndex];
    newList[newIndex] = temp;

    await persistCategoriesState(newList);
    showToast("Category sequence adjusted.");
  };

  const moveItem = async (catId: string, itemIdx: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const catIdx = categories.findIndex(c => c.id === catId);
    if (catIdx === -1) return;

    const category = categories[catIdx];
    const newIdx = direction === "up" ? itemIdx - 1 : itemIdx + 1;
    if (newIdx < 0 || newIdx >= (category.items || []).length) return;

    const newItems = [...category.items];
    const temp = newItems[itemIdx];
    newItems[itemIdx] = newItems[newIdx];
    newItems[newIdx] = temp;

    const newList = categories.map((c, idx) => {
      if (idx === catIdx) {
        return { ...c, items: newItems };
      }
      return c;
    });

    await persistCategoriesState(newList);
    showToast("Item sequence adjusted.");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="admin-uses-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-luxury font-bold tracking-tight">Uses Workbench</h2>
          <p className="text-xs text-text-secondary mt-1">
            Organize operating systems, languages, editors, frameworks, and hardware you use daily
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-3 border border-border bg-surface hover:border-accent hover:text-accent rounded-xl cursor-pointer transition-colors"
            title="Refresh workbench"
          >
            <RefreshCw size={14} />
          </button>
          
          <button
            id="admin-new-category-btn"
            onClick={handleOpenCreateCat}
            className="inline-flex items-center gap-2 px-5 py-3 bg-text-primary text-background hover:bg-accent hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {message && (
        <div 
          id="uses-action-feedback"
          className={`p-4 rounded-xl text-xs font-bold tracking-wide border text-center transition-all ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Two-level Expandable category cards */}
      {categories.length === 0 ? (
        <div className="p-16 border rounded-3xl border-dashed border-border bg-surface text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-text-secondary/10 flex items-center justify-center text-text-secondary">
            <Wrench size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No Categories Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Initialize your environment stack by adding your first hardware or software workspace category.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat, catIdx) => {
            const isExpanded = !!expandedCats[cat.id];
            const isDeletingCat = purgatoryCatId === cat.id;

            return (
              <div 
                key={cat.id}
                id={`cat-block-${cat.id}`}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-border transition-colors shadow-xs"
              >
                {/* Category Header Row */}
                <div 
                  onClick={() => toggleExpand(cat.id)}
                  className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/30 hover:bg-background/60 transition-colors duration-200 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight 
                      size={16} 
                      className={`text-text-secondary transition-transform duration-200 ${isExpanded ? "rotate-90 text-accent" : ""}`}
                    />
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
                        {cat.name}
                        <span className="text-[10px] font-mono text-text-secondary font-medium bg-background border px-2 py-0.5 rounded-md">
                          {(cat.items || []).length} items
                        </span>
                      </h3>
                      {cat.subtitle && (
                        <p className="text-[11px] text-text-secondary mt-0.5">{cat.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Category controls: Edit, Delete, Swapping, Add Item */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    {/* Move operations */}
                    <div className="flex items-center gap-1 border-r border-border pr-2">
                      <button
                        onClick={(e) => moveCategory(catIdx, "up", e)}
                        disabled={catIdx === 0}
                        className="p-1.5 hover:bg-background rounded-lg border border-border/40 hover:border-accent/40 disabled:opacity-30 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                        title="Move Category Up"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={(e) => moveCategory(catIdx, "down", e)}
                        disabled={catIdx === categories.length - 1}
                        className="p-1.5 hover:bg-background rounded-lg border border-border/40 hover:border-accent/40 disabled:opacity-30 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                        title="Move Category Down"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>

                    <button
                      id={`add-item-btn-${cat.id}`}
                      onClick={(e) => handleOpenCreateItem(cat.id, e)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-background border border-border hover:border-accent/30 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:text-accent font-mono transition-all cursor-pointer"
                    >
                      <PlusCircle size={11} />
                      <span>Add Item</span>
                    </button>

                    <button
                      id={`edit-cat-btn-${cat.id}`}
                      onClick={(e) => handleOpenEditCat(cat, e)}
                      className="p-2 bg-background border border-border hover:border-accent/40 hover:text-accent rounded-lg cursor-pointer text-text-secondary transition-colors"
                      title="Edit Category Details"
                    >
                      <Edit2 size={12} />
                    </button>

                    {isDeletingCat ? (
                      <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/25 p-0.5 rounded-lg">
                        <button
                          onClick={(e) => handleConfirmDeleteCat(cat.id, e)}
                          className="px-2 py-1 bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-md hover:bg-red-600 cursor-pointer shrink-0"
                        >
                          Trash
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPurgatoryCatId(null); }}
                          className="px-2 py-1 text-text-secondary hover:text-text-primary text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`trigger-del-cat-${cat.id}`}
                        onClick={(e) => { e.stopPropagation(); setPurgatoryCatId(cat.id); }}
                        className="p-2 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-lg cursor-pointer text-text-secondary transition-colors"
                        title="Delete Entire Category"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanding items lists */}
                {isExpanded && (
                  <div className="p-5 border-t border-border bg-background/5 animate-slide-down space-y-3">
                    {(!cat.items || cat.items.length === 0) ? (
                      <div className="text-center py-6 text-xs text-text-secondary font-medium">
                        No equipment/tech added yet. Click the "Add Item" button above to populate.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cat.items.map((item, itemIdx) => {
                          const isDeletingItem = purgatoryItemId?.catId === cat.id && purgatoryItemId?.itemID === item.id;

                          return (
                            <div 
                              key={item.id}
                              id={`item-row-${item.id}`}
                              className="p-4 bg-surface border border-border/50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-accent/20 transition-all duration-200"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="text-xs font-bold text-text-primary">{item.name}</span>
                                  {item.tag && (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                      <Tag size={8} />
                                      {item.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-text-secondary font-medium leading-relaxed max-w-2xl">{item.description}</p>
                              </div>

                              {/* Item controls: up/down sorting list, edit, trash */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <div className="flex items-center gap-1 border-r border-border/40 pr-1.5">
                                  <button
                                    onClick={(e) => moveItem(cat.id, itemIdx, "up", e)}
                                    disabled={itemIdx === 0}
                                    className="p-1 hover:bg-background border border-border/30 rounded-md disabled:opacity-20 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                                    title="Move Item Up"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => moveItem(cat.id, itemIdx, "down", e)}
                                    disabled={itemIdx === cat.items.length - 1}
                                    className="p-1 hover:bg-background border border-border/30 rounded-md disabled:opacity-20 cursor-pointer text-text-secondary disabled:cursor-not-allowed"
                                    title="Move Item Down"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>

                                <button
                                  id={`edit-item-btn-${item.id}`}
                                  onClick={(e) => handleOpenEditItem(cat.id, item, e)}
                                  className="p-1.5 text-text-secondary hover:text-text-primary border border-border/50 rounded-md bg-background cursor-pointer hover:border-accent/40"
                                  title="Edit Item"
                                >
                                  <Edit2 size={11} />
                                </button>

                                {isDeletingItem ? (
                                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 p-0.5 rounded-md">
                                    <button
                                      onClick={(e) => handleConfirmDeleteItem(cat.id, item.id, e)}
                                      className="px-2 py-0.5 bg-red-500 text-white font-bold text-[8px] uppercase tracking-wider rounded-md hover:bg-red-600 cursor-pointer shrink-0"
                                    >
                                      Trash
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setPurgatoryItemId(null); }}
                                      className="px-2 py-0.5 text-text-secondary hover:text-text-primary text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      Keep
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    id={`trigger-del-item-${item.id}`}
                                    onClick={(e) => { e.stopPropagation(); setPurgatoryItemId({ catId: cat.id, itemID: item.id }); }}
                                    className="p-1.5 text-text-secondary hover:text-red-500 border border-border/50 rounded-md bg-background cursor-pointer hover:border-red-500/40"
                                    title="Delete Item"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal (Create/Edit) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div 
            id="cat-modal-container"
            className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-md space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editingCat ? "Edit Category Stack" : "Create Uses Category"}
              </h3>
              <button 
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Category Title (ALL-CAPS)</label>
                <input
                  id="cat-name-input"
                  type="text"
                  required
                  placeholder="e.g. HARDWARE, WORKSTATION"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Subtitle Summary</label>
                <input
                  id="cat-subtitle-input"
                  type="text"
                  placeholder="e.g. Tools I interact with daily."
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 font-mono font-bold text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
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

      {/* Item Modal (Create/Edit) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div 
            id="item-modal-container"
            className="bg-surface border border-border p-6 md:p-8 rounded-3xl w-full max-w-md space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left"
          >
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="text-base font-luxury font-bold uppercase tracking-wider">
                {editingItem ? "Edit item metadata" : "Add Tech/Equipment Item"}
              </h3>
              <button 
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer border border-border hover:border-accent/40 rounded-xl"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Item Name</label>
                <input
                  id="item-name-input"
                  type="text"
                  required
                  placeholder="e.g. Keychron K3 Pro"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Item highlight Tag (Optional)</label>
                <input
                  id="item-tag-input"
                  type="text"
                  placeholder="e.g. DAILY DRIVER, RUNS AT EDGE"
                  value={itemTag}
                  onChange={(e) => setItemTag(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Item Description, specs or review</label>
                <textarea
                  id="item-description-textarea"
                  rows={4}
                  required
                  placeholder="Describe your review, key layout specs or reason for routing this tool..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:border-accent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 font-mono font-bold text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
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
