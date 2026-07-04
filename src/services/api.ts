import { AboutProfile, FaqItem, UsesCategory, PrivacySection, SiteSettings, Entry, Service } from "../models/portfolio.model";

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is required. Portfolio content is served from the Cloudflare R2 CMS only.");
  }
  return API_BASE_URL;
}

function getSessionToken(): string | null {
  return localStorage.getItem("admin_session");
}

function authHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch {
      // Keep the status text for non-JSON error responses.
    }
    throw new Error(detail || `API responded with status ${response.status} for ${path}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = requireApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, init);
  return parseJsonResponse<T>(response, path);
}

async function fetchList<T>(path: string): Promise<T[]> {
  const data = await fetchJson<T[]>(path);
  return Array.isArray(data) ? data : [];
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchJson<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  invalidateReadCache();
  return res;
}

async function putJson<T>(path: string, data: unknown): Promise<T> {
  const res = await fetchJson<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  invalidateReadCache();
  return res;
}

async function deleteJson<T>(path: string): Promise<T> {
  const res = await fetchJson<T>(path, {
    method: "DELETE",
    headers: authHeaders(),
  });
  invalidateReadCache();
  return res;
}

/**
 * Read-through cache for public GET endpoints. Multiple components (Portfolio5,
 * AboutPage, usePortfolioData, …) request the same settings/about/entries payloads,
 * and React StrictMode double-invokes effects in dev — this collapses all of that
 * into a single network request per resource. Any mutation clears the cache so the
 * admin sees fresh data after editing.
 */
const readCache = new Map<string, Promise<unknown>>();

function cachedGet<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = readCache.get(key);
  if (hit) return hit as Promise<T>;
  const pending = loader().catch((err) => {
    readCache.delete(key); // never cache a failed read
    throw err;
  });
  readCache.set(key, pending);
  return pending as Promise<T>;
}

export function invalidateReadCache(): void {
  readCache.clear();
}

export async function getEntries(): Promise<Entry[]> {
  return cachedGet("/entries", () => fetchList<Entry>("/entries"));
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const data = await postJson<{ token?: string; jwt?: string; accessToken?: string; id_token?: string } | string>("/auth/login", {
      username,
      password,
    });
    const token =
      typeof data === "string"
        ? data
        : data.token || data.jwt || data.accessToken || data.id_token || JSON.stringify(data);
    if (!token) return false;
    localStorage.setItem("admin_session", token);
    return true;
  } catch (error) {
    console.warn("Remote login failed:", error);
    localStorage.removeItem("admin_session");
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem("admin_session");
}

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

export async function createEntry(data: Partial<Entry>): Promise<Entry> {
  return postJson<Entry>("/entries", data);
}

export async function updateEntry(id: number | string, data: Partial<Entry>): Promise<Entry> {
  return putJson<Entry>(`/entries/${id}`, data);
}

export async function deleteEntry(id: number | string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/entries/${id}`);
  return true;
}

export async function getAboutProfile(): Promise<AboutProfile> {
  return cachedGet("/about", () => fetchJson<AboutProfile>("/about"));
}

export async function updateAboutProfile(data: AboutProfile): Promise<boolean> {
  await putJson<{ success: boolean }>("/about", data);
  return true;
}

export async function getFaqItems(): Promise<FaqItem[]> {
  return cachedGet("/faq", () => fetchList<FaqItem>("/faq"));
}

export async function createFaqItem(data: Partial<FaqItem>): Promise<FaqItem> {
  return postJson<FaqItem>("/faq", data);
}

export async function updateFaqItem(id: number | string, data: Partial<FaqItem>): Promise<FaqItem> {
  return putJson<FaqItem>(`/faq/${id}`, data);
}

export async function deleteFaqItem(id: number | string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/faq/${id}`);
  return true;
}

export async function getUsesCategories(): Promise<UsesCategory[]> {
  return cachedGet("/uses", () => fetchList<UsesCategory>("/uses"));
}

export async function createUsesCategory(data: Partial<UsesCategory>): Promise<UsesCategory> {
  return postJson<UsesCategory>("/uses", data);
}

export async function updateUsesCategory(id: string, data: Partial<UsesCategory>): Promise<UsesCategory> {
  return putJson<UsesCategory>(`/uses/${id}`, data);
}

export async function deleteUsesCategory(id: string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/uses/${id}`);
  return true;
}

export async function createUsesItem(categoryId: string, data: any): Promise<any> {
  return postJson<any>(`/uses/${categoryId}/items`, data);
}

export async function updateUsesItem(categoryId: string, itemId: string, data: any): Promise<any> {
  return putJson<any>(`/uses/${categoryId}/items/${itemId}`, data);
}

export async function deleteUsesItem(categoryId: string, itemId: string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/uses/${categoryId}/items/${itemId}`);
  return true;
}

export async function getPrivacySections(): Promise<PrivacySection[]> {
  return cachedGet("/privacy", () => fetchList<PrivacySection>("/privacy"));
}

export async function createPrivacySection(data: Partial<PrivacySection>): Promise<PrivacySection> {
  return postJson<PrivacySection>("/privacy", data);
}

export async function updatePrivacySection(id: string, data: Partial<PrivacySection>): Promise<PrivacySection> {
  return putJson<PrivacySection>(`/privacy/${id}`, data);
}

export async function deletePrivacySection(id: string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/privacy/${id}`);
  return true;
}

export async function reorderPrivacySections(orderedIds: string[]): Promise<boolean> {
  await postJson<{ success: boolean }>("/privacy/reorder", { orderedIds });
  return true;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return cachedGet("/settings", () => fetchJson<SiteSettings>("/settings"));
}

export async function updateSiteSettings(data: SiteSettings): Promise<boolean> {
  await putJson<{ success: boolean }>("/settings", data);
  return true;
}

export async function getServices(): Promise<Service[]> {
  return cachedGet("/services", () => fetchList<Service>("/services"));
}

export async function createService(data: Partial<Service>): Promise<Service> {
  return postJson<Service>("/services", data);
}

export async function updateService(id: number | string, data: Partial<Service>): Promise<Service> {
  return putJson<Service>(`/services/${id}`, data);
}

export async function deleteService(id: number | string): Promise<boolean> {
  await deleteJson<{ success: boolean }>(`/services/${id}`);
  return true;
}

/** Upload a media blob to the Cloudflare R2-backed CMS and return its public URL. */
export async function uploadFile(blob: Blob, category: string, filename?: string): Promise<string> {
  const name = filename || (blob instanceof File ? blob.name : `${category}-${Date.now()}.webp`);
  const form = new FormData();
  form.append("file", blob, name);
  form.append("category", category);

  const baseUrl = requireApiBaseUrl();
  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  const data = await parseJsonResponse<{ url: string }>(response, "/upload");
  return data.url;
}
