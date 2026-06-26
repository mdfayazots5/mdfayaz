import { Project, AboutProfile, FaqItem, UsesCategory, PrivacySection, SiteSettings, Product, Entry, Service } from "../models/portfolio.model";
import { ABOUT_FALLBACK } from "../data/fallback/about.fallback";
import { FAQ_FALLBACK } from "../data/fallback/faq.fallback";
import { USES_FALLBACK } from "../data/fallback/uses.fallback";
import { PRIVACY_FALLBACK } from "../data/fallback/privacy.fallback";
import { SETTINGS_FALLBACK } from "../data/fallback/settings.fallback";
import { ENTRIES_FALLBACK } from "../data/fallback/entries.fallback";
import { SERVICES_FALLBACK } from "../data/fallback/services.fallback";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;

function isEmtpyOrNull(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj) && obj.length === 0) return true;
  if (typeof obj === "object" && Object.keys(obj).length === 0) return true;
  return false;
}

function getLocalServices(): Service[] {
  const cached = localStorage.getItem("local_services");
  if (!cached) {
    localStorage.setItem("local_services", JSON.stringify(SERVICES_FALLBACK));
    return SERVICES_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return SERVICES_FALLBACK;
  }
}

function saveLocalServices(services: Service[]): void {
  localStorage.setItem("local_services", JSON.stringify(services));
}

function getLocalEntries(): Entry[] {
  const cached = localStorage.getItem("local_entries");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // legacy fallback
    }
  }

  // Check one-time migration
  const oldProjectsStr = localStorage.getItem("local_projects");
  const oldProductsStr = localStorage.getItem("local_products");

  if (oldProjectsStr || oldProductsStr) {
    const migrated: Entry[] = [];
    
    if (oldProjectsStr) {
      try {
        const oldProjects: Project[] = JSON.parse(oldProjectsStr);
        oldProjects.forEach(project => {
          migrated.push({
            id: project.id,
            type: project.category === "personal" ? "personal" : "company",
            title: project.name,
            tagline: project.shortName || project.domain || "",
            categoryTag: project.domain || "Project",
            description: project.description,
            features: project.bullets || [],
            tech: project.tech || [],
            achievements: [],
            companyName: project.category === "personal" ? undefined : (project.companyName || "Revalsys Technologies"),
            role: project.role,
            teamSize: (project.name?.includes("Healthcare") || project.name?.includes("Onboarding") || project.role?.includes("Lead")) ? 5 : undefined,
            startDate: project.startDate,
            endDate: project.endDate,
            featured: false,
            displayOrder: project.id,
            color: project.color || "#0EA5E9",
            icon: project.icon || "Briefcase"
          });
        });
        localStorage.setItem("local_projects_backup", oldProjectsStr);
        localStorage.removeItem("local_projects");
      } catch (e) {
        console.error("Migration error for old projects", e);
      }
    }

    if (oldProductsStr) {
      try {
        const oldProducts: Product[] = JSON.parse(oldProductsStr);
        oldProducts.forEach(product => {
          migrated.push({
            id: product.id + 100, // Offset to prevent duplicate ids
            type: "personal",
            title: product.name,
            tagline: product.tagline,
            categoryTag: product.categoryTag || "Product",
            description: product.description,
            features: product.features || [],
            tech: product.tech || [],
            status: product.status as any,
            audience: product.audience,
            coverImage: product.previewImage,
            liveUrl: product.link,
            achievements: [],
            featured: false,
            displayOrder: (product.displayOrder || product.id) + 100,
            color: "#3B82F6",
            icon: product.icon || "Package"
          });
        });
        localStorage.setItem("local_products_backup", oldProductsStr);
        localStorage.removeItem("local_products");
      } catch (e) {
        console.error("Migration error for old products", e);
      }
    }

    if (migrated.length > 0) {
      localStorage.setItem("local_entries", JSON.stringify(migrated));
      return migrated;
    }
  }

  // Otherwise, seed from ENTRIES_FALLBACK
  localStorage.setItem("local_entries", JSON.stringify(ENTRIES_FALLBACK));
  return ENTRIES_FALLBACK;
}

function saveLocalEntries(entries: Entry[]): void {
  localStorage.setItem("local_entries", JSON.stringify(entries));
}

function getLocalFaq(): FaqItem[] {
  const cached = localStorage.getItem("local_faq");
  if (!cached) {
    localStorage.setItem("local_faq", JSON.stringify(FAQ_FALLBACK));
    return FAQ_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return FAQ_FALLBACK;
  }
}

function saveLocalFaq(faq: FaqItem[]): void {
  localStorage.setItem("local_faq", JSON.stringify(faq));
}

function getLocalUses(): UsesCategory[] {
  const cached = localStorage.getItem("local_uses");
  if (!cached) {
    localStorage.setItem("local_uses", JSON.stringify(USES_FALLBACK));
    return USES_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return USES_FALLBACK;
  }
}

function saveLocalUses(uses: UsesCategory[]): void {
  localStorage.setItem("local_uses", JSON.stringify(uses));
}

function getLocalPrivacy(): PrivacySection[] {
  const cached = localStorage.getItem("local_privacy");
  if (!cached) {
    localStorage.setItem("local_privacy", JSON.stringify(PRIVACY_FALLBACK));
    return PRIVACY_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return PRIVACY_FALLBACK;
  }
}

function saveLocalPrivacy(privacy: PrivacySection[]): void {
  localStorage.setItem("local_privacy", JSON.stringify(privacy));
}

function getLocalAbout(): AboutProfile {
  const cached = localStorage.getItem("local_about");
  if (!cached) {
    localStorage.setItem("local_about", JSON.stringify(ABOUT_FALLBACK));
    return ABOUT_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return ABOUT_FALLBACK;
  }
}

function saveLocalAbout(about: AboutProfile): void {
  localStorage.setItem("local_about", JSON.stringify(about));
}

function getLocalSettings(): SiteSettings {
  const cached = localStorage.getItem("local_settings");
  if (!cached) {
    localStorage.setItem("local_settings", JSON.stringify(SETTINGS_FALLBACK));
    return SETTINGS_FALLBACK;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return SETTINGS_FALLBACK;
  }
}

function saveLocalSettings(settings: SiteSettings): void {
  localStorage.setItem("local_settings", JSON.stringify(settings));
}



export async function getEntries(): Promise<Entry[]> {
  if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is empty/undefined. Sourcing entries from localStorage / fallback data.");
    return getLocalEntries();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/entries`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /entries. Using fallback data.`);
      return ENTRIES_FALLBACK;
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /entries. Using fallback data.");
      return ENTRIES_FALLBACK;
    }
    return data as Entry[];
  } catch (error) {
    console.warn("Failed to fetch entries from API due to a network or CORS error. Using fallback data.", error);
    return getLocalEntries();
  }
}

export async function login(username: string, password: string): Promise<boolean> {
  // Always allow fallback login credentials first or on error
  const localDefaultUser = (import.meta as any).env.VITE_ADMIN_USERNAME || "admin";
  const localDefaultPass = (import.meta as any).env.VITE_ADMIN_PASSWORD || "changeme";

  if (!API_BASE_URL) {
    if (username === localDefaultUser && password === localDefaultPass) {
      localStorage.setItem("admin_session", "local");
      return true;
    }
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      // Check local credentials on server rejection
      if (username === localDefaultUser && password === localDefaultPass) {
        localStorage.setItem("admin_session", "local");
        return true;
      }
      return false;
    }
    const data = await response.json();
    const token = data.token || data.jwt || data.accessToken || data.id_token || (typeof data === "string" ? data : JSON.stringify(data));
    localStorage.setItem("admin_session", token || "authenticated");
    return true;
  } catch (e) {
    console.warn("Login fetch failed. Attempting administrator credential fallback:", e);
    if (username === localDefaultUser && password === localDefaultPass) {
      localStorage.setItem("admin_session", "local");
      return true;
    }
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem("admin_session");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("admin_session");
}

export async function createEntry(data: any): Promise<Entry> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const entries = getLocalEntries();
    const maxId = entries.reduce((max, e) => e.id > max ? e.id : max, 0);
    const newEntry: Entry = {
      ...data,
      id: maxId + 1,
      achievements: data.achievements || [],
      features: data.features || [],
      tech: data.tech || [],
      featured: !!data.featured,
      displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : maxId + 1,
      icon: data.icon || "Briefcase",
      color: data.color || "#0EA5E9"
    };
    entries.push(newEntry);
    saveLocalEntries(entries);
    return newEntry;
  };

  if (useLocal) {
    return executeLocalCreate();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create entry: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createEntry remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updateEntry(id: number | string, data: any): Promise<Entry> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalUpdate = () => {
    const entries = getLocalEntries();
    const index = entries.findIndex(e => e.id === numericId || String(e.id) === String(id));
    if (index === -1) throw new Error("Entry not found in client storage sandbox");
    const updatedEntry: Entry = {
      ...entries[index],
      ...data
    };
    entries[index] = updatedEntry;
    saveLocalEntries(entries);
    return updatedEntry;
  };

  if (useLocal) {
    return executeLocalUpdate();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update entry: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updateEntry remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deleteEntry(id: number | string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalDelete = () => {
    const entries = getLocalEntries();
    const updated = entries.filter(e => e.id !== numericId && String(e.id) !== String(id));
    saveLocalEntries(updated);
    return true;
  };

  if (useLocal) {
    return executeLocalDelete();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete entry: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.warn("deleteEntry remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}

export async function getAboutProfile(): Promise<AboutProfile> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  if (useLocal) {
    return getLocalAbout();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/about`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /about. Using local data fallback.`);
      return getLocalAbout();
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /about. Using local data fallback.");
      return getLocalAbout();
    }
    return data as AboutProfile;
  } catch (error) {
    console.warn("Failed to fetch about profile from API due to a network or CORS error. Using local data fallback.", error);
    return getLocalAbout();
  }
}

export async function getFaqItems(): Promise<FaqItem[]> {
  if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is empty/undefined. Sourcing FAQ items from localStorage / fallback data.");
    return getLocalFaq();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/faq`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /faq. Using localStorage fallback.`);
      return getLocalFaq();
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /faq. Using localStorage fallback.");
      return getLocalFaq();
    }
    return data as FaqItem[];
  } catch (error) {
    console.warn("Failed to fetch FAQ items from API due to a network or CORS error. Using localStorage fallback.", error);
    return getLocalFaq();
  }
}

export async function getUsesCategories(): Promise<UsesCategory[]> {
  if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is empty/undefined. Sourcing uses categories from localStorage / fallback data.");
    return getLocalUses();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/uses`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /uses. Using localStorage fallback.`);
      return getLocalUses();
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /uses. Using localStorage fallback.");
      return getLocalUses();
    }
    return data as UsesCategory[];
  } catch (error) {
    console.warn("Failed to fetch uses categories from API due to a network or CORS error. Using localStorage fallback.", error);
    return getLocalUses();
  }
}

export async function getPrivacySections(): Promise<PrivacySection[]> {
  if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is empty/undefined. Sourcing privacy sections from localStorage / fallback data.");
    return getLocalPrivacy();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/privacy`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /privacy. Using localStorage fallback.`);
      return getLocalPrivacy();
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /privacy. Using localStorage fallback.");
      return getLocalPrivacy();
    }
    return data as PrivacySection[];
  } catch (error) {
    console.warn("Failed to fetch privacy sections from API due to a network or CORS error. Using localStorage fallback.", error);
    return getLocalPrivacy();
  }
}

// FAQ CRUD APIs
export async function createFaqItem(data: any): Promise<FaqItem> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const list = getLocalFaq();
    const maxId = list.reduce((max, x) => x.id > max ? x.id : max, 0);
    const newItem: FaqItem = {
      ...data,
      id: maxId + 1
    };
    list.push(newItem);
    saveLocalFaq(list);
    return newItem;
  };

  if (useLocal) return executeLocalCreate();

  try {
    const response = await fetch(`${API_BASE_URL}/faq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create FAQ: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createFaqItem remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updateFaqItem(id: number | string, data: any): Promise<FaqItem> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalUpdate = () => {
    const list = getLocalFaq();
    const index = list.findIndex(x => x.id === numericId || String(x.id) === String(id));
    if (index === -1) throw new Error("FAQ item not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    saveLocalFaq(list);
    return updated;
  };

  if (useLocal) return executeLocalUpdate();

  try {
    const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update FAQ: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updateFaqItem remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deleteFaqItem(id: number | string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalDelete = () => {
    const list = getLocalFaq();
    const filtered = list.filter(x => x.id !== numericId && String(x.id) !== String(id));
    saveLocalFaq(filtered);
    return true;
  };

  if (useLocal) return executeLocalDelete();

  try {
    const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) throw new Error(`Failed to delete FAQ: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("deleteFaqItem remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}

// Uses CRUD APIs
export async function createUsesCategory(data: any): Promise<UsesCategory> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const list = getLocalUses();
    const newCategory: UsesCategory = {
      ...data,
      id: data.id || "cat_" + Date.now().toString(),
      items: data.items || []
    };
    list.push(newCategory);
    saveLocalUses(list);
    return newCategory;
  };

  if (useLocal) return executeLocalCreate();

  try {
    const response = await fetch(`${API_BASE_URL}/uses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create Uses category: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createUsesCategory remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updateUsesCategory(id: string, data: any): Promise<UsesCategory> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalUpdate = () => {
    const list = getLocalUses();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    saveLocalUses(list);
    return updated;
  };

  if (useLocal) return executeLocalUpdate();

  try {
    const response = await fetch(`${API_BASE_URL}/uses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update Uses category: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updateUsesCategory remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deleteUsesCategory(id: string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalDelete = () => {
    const list = getLocalUses();
    const filtered = list.filter(c => c.id !== id);
    saveLocalUses(filtered);
    return true;
  };

  if (useLocal) return executeLocalDelete();

  try {
    const response = await fetch(`${API_BASE_URL}/uses/${id}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) throw new Error(`Failed to delete category: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("deleteUsesCategory remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}

export async function createUsesItem(categoryId: string, data: any): Promise<any> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const list = getLocalUses();
    const catIndex = list.findIndex(c => c.id === categoryId);
    if (catIndex === -1) throw new Error("Category not found");
    const newItem = {
      ...data,
      id: data.id || "item_" + Date.now().toString()
    };
    if (!list[catIndex].items) {
      list[catIndex].items = [];
    }
    list[catIndex].items.push(newItem);
    saveLocalUses(list);
    return newItem;
  };

  if (useLocal) return executeLocalCreate();

  try {
    const response = await fetch(`${API_BASE_URL}/uses/${categoryId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create Uses item: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createUsesItem remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updateUsesItem(categoryId: string, itemId: string, data: any): Promise<any> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalUpdate = () => {
    const list = getLocalUses();
    const catIndex = list.findIndex(c => c.id === categoryId);
    if (catIndex === -1) throw new Error("Category not found");
    const itemIndex = list[catIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error("Item not found");
    const updated = { ...list[catIndex].items[itemIndex], ...data };
    list[catIndex].items[itemIndex] = updated;
    saveLocalUses(list);
    return updated;
  };

  if (useLocal) return executeLocalUpdate();

  try {
    const response = await fetch(`${API_BASE_URL}/uses/${categoryId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update Uses item: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updateUsesItem remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deleteUsesItem(categoryId: string, itemId: string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalDelete = () => {
    const list = getLocalUses();
    const catIndex = list.findIndex(c => c.id === categoryId);
    if (catIndex === -1) throw new Error("Category not found");
    list[catIndex].items = list[catIndex].items.filter(i => i.id !== itemId);
    saveLocalUses(list);
    return true;
  };

  if (useLocal) return executeLocalDelete();

  try {
    const response = await fetch(`${API_BASE_URL}/uses/${categoryId}/items/${itemId}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) throw new Error(`Failed to delete Uses item: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("deleteUsesItem remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}

// Privacy CRUD APIs
export async function createPrivacySection(data: any): Promise<PrivacySection> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const list = getLocalPrivacy();
    const newSection: PrivacySection = {
      ...data,
      id: data.id || "priv_" + Date.now().toString()
    };
    list.push(newSection);
    saveLocalPrivacy(list);
    return newSection;
  };

  if (useLocal) return executeLocalCreate();

  try {
    const response = await fetch(`${API_BASE_URL}/privacy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create privacy section: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createPrivacySection remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updatePrivacySection(id: string, data: any): Promise<PrivacySection> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalUpdate = () => {
    const list = getLocalPrivacy();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Privacy section not found");
    const updated = { ...list[index], ...data };
    list[index] = updated;
    saveLocalPrivacy(list);
    return updated;
  };

  if (useLocal) return executeLocalUpdate();

  try {
    const response = await fetch(`${API_BASE_URL}/privacy/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update privacy section: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updatePrivacySection remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deletePrivacySection(id: string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalDelete = () => {
    const list = getLocalPrivacy();
    const filtered = list.filter(s => s.id !== id);
    saveLocalPrivacy(filtered);
    return true;
  };

  if (useLocal) return executeLocalDelete();

  try {
    const response = await fetch(`${API_BASE_URL}/privacy/${id}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) throw new Error(`Failed to delete privacy section: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("deletePrivacySection remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}

export async function reorderPrivacySections(orderedIds: string[]): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalReorder = () => {
    const originalList = getLocalPrivacy();
    const reordered: PrivacySection[] = [];
    orderedIds.forEach(id => {
      const sec = originalList.find(s => s.id === id);
      if (sec) reordered.push(sec);
    });
    // Append any sections not included in the ordered list (fail-safe)
    originalList.forEach(sec => {
      if (!reordered.find(s => s.id === sec.id)) {
        reordered.push(sec);
      }
    });
    saveLocalPrivacy(reordered);
    return true;
  };

  if (useLocal) return executeLocalReorder();

  try {
    const response = await fetch(`${API_BASE_URL}/privacy/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify({ orderedIds })
    });
    if (!response.ok) throw new Error(`Failed to reorder privacy sections: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("reorderPrivacySections remote error, falling back locally:", error);
    return executeLocalReorder();
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  if (useLocal) {
    return getLocalSettings();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /settings. Using local data fallback.`);
      return getLocalSettings();
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /settings. Using local data fallback.");
      return getLocalSettings();
    }
    return data as SiteSettings;
  } catch (error) {
    console.warn("Failed to fetch site settings from API due to a network or CORS error. Using local data fallback.", error);
    return getLocalSettings();
  }
}

export async function updateAboutProfile(data: AboutProfile): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  if (useLocal) {
    saveLocalAbout(data);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update about profile: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("updateAboutProfile remote error, falling back locally:", error);
    saveLocalAbout(data);
    return true;
  }
}

export async function updateSiteSettings(data: SiteSettings): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  if (useLocal) {
    saveLocalSettings(data);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update site settings: ${response.statusText}`);
    return true;
  } catch (error) {
    console.warn("updateSiteSettings remote error, falling back locally:", error);
    saveLocalSettings(data);
    return true;
  }
}

export async function getServices(): Promise<Service[]> {
  if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL is empty/undefined. Sourcing services from localStorage / fallback data.");
    return getLocalServices();
  }
  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) {
      console.warn(`API responded with status ${response.status} for /services. Using fallback data.`);
      return SERVICES_FALLBACK;
    }
    const data = await response.json();
    if (isEmtpyOrNull(data)) {
      console.warn("API resolved to empty or null result for /services. Using fallback data.");
      return SERVICES_FALLBACK;
    }
    return data as Service[];
  } catch (error) {
    console.warn("Failed to fetch services from API due to a network or CORS error. Using fallback data.", error);
    return getLocalServices();
  }
}

export async function createService(data: any): Promise<Service> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";

  const executeLocalCreate = () => {
    const services = getLocalServices();
    const maxId = services.reduce((max, s) => s.id > max ? s.id : max, 0);
    const newService: Service = {
      ...data,
      id: maxId + 1,
      highlights: data.highlights || [],
      status: data.status || "Active",
      displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : maxId + 1,
      icon: data.icon || "Server"
    };
    services.push(newService);
    saveLocalServices(services);
    return newService;
  };

  if (useLocal) {
    return executeLocalCreate();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to create service: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("createService remote error, falling back locally:", error);
    return executeLocalCreate();
  }
}

export async function updateService(id: number | string, data: any): Promise<Service> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalUpdate = () => {
    const services = getLocalServices();
    const index = services.findIndex(s => s.id === numericId || String(s.id) === String(id));
    if (index === -1) throw new Error("Service not found in client storage sandbox");
    const updatedService: Service = {
      ...services[index],
      ...data
    };
    services[index] = updatedService;
    saveLocalServices(services);
    return updatedService;
  };

  if (useLocal) {
    return executeLocalUpdate();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update service: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("updateService remote error, falling back locally:", error);
    return executeLocalUpdate();
  }
}

export async function deleteService(id: number | string): Promise<boolean> {
  const session = localStorage.getItem("admin_session");
  const useLocal = !API_BASE_URL || session === "local";
  const numericId = Number(id);

  const executeLocalDelete = () => {
    const services = getLocalServices();
    const updated = services.filter(s => s.id !== numericId && String(s.id) !== String(id));
    saveLocalServices(updated);
    return true;
  };

  if (useLocal) {
    return executeLocalDelete();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "DELETE",
      headers: {
        ...(session && session !== "local" ? { "Authorization": `Bearer ${session}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete service: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.warn("deleteService remote error, falling back locally:", error);
    return executeLocalDelete();
  }
}


