import React, { useEffect, useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  X,
  User,
  Wallpaper,
} from "lucide-react";
import { getSiteSettings, updateSiteSettings, uploadFile } from "../../services/api";
import { SiteSettings } from "../../models/portfolio.model";
import { LoadingScreen } from "../LoadingScreen";
import { getCroppedBlob, readImageDimensions } from "./cropImage";

type SlotKey = "profileImage" | "heroBackground";
type Variant = "desktop" | "mobile";

// Mirror the Worker's upload contract: image-only (SVG blocked), 5 MB hard cap.
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_PROFILE_DIMENSION = 400;

interface SlotConfig {
  key: SlotKey;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: string;
  aspect: Record<Variant, number>;
  previewClass: Record<Variant, string>;
}

const SLOTS: SlotConfig[] = [
  {
    key: "profileImage",
    title: "Profile Image",
    blurb: "Square portrait shown in the About section. Framed 1:1 for both breakpoints.",
    icon: User,
    category: "profile",
    aspect: { desktop: 1, mobile: 1 },
    previewClass: { desktop: "w-28 h-28 rounded-full", mobile: "w-28 h-28 rounded-full" },
  },
  {
    key: "heroBackground",
    title: "Hero Background",
    blurb: "Photo behind the About hero. Landscape 16:9 on desktop, portrait 4:5 on mobile.",
    icon: Wallpaper,
    category: "hero",
    aspect: { desktop: 16 / 9, mobile: 4 / 5 },
    previewClass: { desktop: "w-48 h-28 rounded-xl", mobile: "w-24 h-32 rounded-xl" },
  },
];

interface CropSession {
  slot: SlotConfig;
  variant: Variant;
  imageSrc: string;
}

export const AdminMediaPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);

  // Active crop session + interactive crop state.
  const [session, setSession] = useState<CropSession | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings()
      .then((data) => {
        if (isMounted) setSettings(data);
      })
      .catch(() => {
        if (isMounted) showToast("Failed to load site settings.", "error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4200);
  };

  const getVariantUrl = (slot: SlotKey, variant: Variant): string => {
    return (settings?.[slot]?.[variant]) || "";
  };

  // Persist a single variant URL: merge into settings and PUT the full object (existing contract).
  const persistVariant = async (slot: SlotKey, variant: Variant, url: string) => {
    if (!settings) return;
    const nextSlot = { ...(settings[slot] || {}), [variant]: url };
    const next: SiteSettings = { ...settings, [slot]: nextSlot };
    setSettings(next);
    const ok = await updateSiteSettings(next);
    if (!ok) throw new Error("Settings save failed");
  };

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFileSelected = async (
    slot: SlotConfig,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = "";
    if (!file) return;

    // 1) Type guard — mirror the Worker allow-list; SVG is explicitly rejected.
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Unsupported file type. Use JPG, PNG, or WebP (no SVG).", "error");
      return;
    }

    // 2) Size guard — reject > 5 MB before doing any work.
    if (file.size > MAX_BYTES) {
      showToast("Image exceeds 5 MB — please crop/compress it first.", "error");
      return;
    }

    // 3) Soft quality warning for small profile sources (non-blocking).
    if (slot.key === "profileImage") {
      try {
        const { width, height } = await readImageDimensions(file);
        if (width < MIN_PROFILE_DIMENSION || height < MIN_PROFILE_DIMENSION) {
          showToast(
            `Heads up: image is ${width}×${height}px — under ${MIN_PROFILE_DIMENSION}px may look soft.`,
            "error"
          );
        }
      } catch {
        // Dimension read is best-effort; continue to the cropper regardless.
      }
    }

    const imageSrc = URL.createObjectURL(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSession({ slot, variant, imageSrc });
  };

  const closeCropper = () => {
    if (session) URL.revokeObjectURL(session.imageSrc);
    setSession(null);
    setCroppedAreaPixels(null);
  };

  const handleConfirmCrop = async () => {
    if (!session || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(session.imageSrc, croppedAreaPixels, "image/webp", 0.9);

      // Final guard: the compressed export must also fit the Worker's 5 MB cap.
      if (blob.size > MAX_BYTES) {
        showToast("Cropped image is still over 5 MB — zoom in or use a smaller source.", "error");
        setBusy(false);
        return;
      }

      const filename = `${session.slot.category}-${session.variant}-${Date.now()}.webp`;
      const url = await uploadFile(blob, session.slot.category, filename);
      await persistVariant(session.slot.key, session.variant, url);
      showToast(`${session.slot.title} (${session.variant}) uploaded & saved.`);
      closeCropper();
    } catch (err: any) {
      console.error("Media upload failed:", err);
      showToast(err?.message || "Upload failed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (slot: SlotConfig, variant: Variant) => {
    if (!settings) return;
    setBusy(true);
    try {
      await persistVariant(slot.key, variant, "");
      showToast(`${slot.title} (${variant}) removed.`);
    } catch (err: any) {
      console.error("Failed to remove media:", err);
      showToast("Could not update settings. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-500">Error</h3>
        <p className="text-text-secondary">Failed to retrieve settings for media management.</p>
      </div>
    );
  }

  return (
    <div id="admin-media-root" className="space-y-10 animate-fade-in text-left">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-[200] max-w-md p-4 rounded-xl shadow-lg border border-border flex items-center gap-3 transition-all duration-300 ${
            message.type === "success"
              ? "bg-surface text-text-primary"
              : "bg-surface text-red-500 border-red-500/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={16} className="text-accent" />
          ) : (
            <AlertTriangle size={16} className="text-red-500" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <ImageIcon className="text-accent" size={18} />
          <h2 className="text-xl font-luxury font-bold tracking-tight uppercase">Media</h2>
        </div>
        <p className="text-xs text-text-secondary mt-1 max-w-2xl">
          Upload and crop your profile picture and hero background. Set a separate Desktop and Mobile
          variant per slot for correct framing on every screen — if Mobile is empty it inherits Desktop.
          JPG / PNG / WebP only, 5 MB max.
        </p>
      </div>

      {/* Media Slots */}
      {SLOTS.map((slot) => {
        const SlotIcon = slot.icon;
        return (
          <section key={slot.key} className="bg-surface p-6 rounded-2xl border border-border space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <SlotIcon size={16} className="text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{slot.title}</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">{slot.blurb}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["desktop", "mobile"] as Variant[]).map((variant) => {
                const url = getVariantUrl(slot.key, variant);
                const VariantIcon = variant === "desktop" ? Monitor : Smartphone;
                const inputId = `media-${slot.key}-${variant}`;
                const inheriting = variant === "mobile" && !url && !!getVariantUrl(slot.key, "desktop");
                return (
                  <div key={variant} className="bg-background border border-border/60 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                        <VariantIcon size={12} className="text-text-secondary" />
                        {variant}
                        <span className="text-text-secondary/60 normal-case tracking-normal">
                          · {slot.aspect[variant].toFixed(2).replace(/\.00$/, "")}:1
                        </span>
                      </span>
                      {url && (
                        <button
                          type="button"
                          onClick={() => handleRemove(slot, variant)}
                          disabled={busy}
                          className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors disabled:opacity-40"
                          title={`Remove ${variant} image`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Preview */}
                    <div className="flex items-center justify-center min-h-[8rem] rounded-xl border border-dashed border-border bg-surface/40 p-3">
                      {url ? (
                        <img
                          src={url}
                          alt={`${slot.title} ${variant}`}
                          className={`object-cover border border-border ${slot.previewClass[variant]}`}
                        />
                      ) : inheriting ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/70 text-center px-3">
                          Inherits desktop
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/50 text-center px-3">
                          No image set
                        </span>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      id={inputId}
                      className="hidden"
                      onChange={(e) => handleFileSelected(slot, variant, e)}
                    />
                    <label
                      htmlFor={inputId}
                      className="w-full px-4 py-2.5 border border-border bg-surface hover:border-accent/40 text-text-primary hover:text-accent rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UploadCloud size={13} />
                      <span>{url ? "Replace" : "Upload"} {variant}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Crop Modal */}
      {session && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={busy ? undefined : closeCropper} />
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon size={15} className="text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Crop {session.slot.title} · {session.variant}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCropper}
                disabled={busy}
                className="p-1 text-text-secondary hover:text-text-primary cursor-pointer disabled:opacity-40"
                aria-label="Close cropper"
              >
                <X size={18} />
              </button>
            </div>

            {/* Crop surface */}
            <div className="relative w-full h-[46vh] bg-black">
              <Cropper
                image={session.imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={session.slot.aspect[session.variant]}
                cropShape={session.slot.key === "profileImage" ? "round" : "rect"}
                showGrid={session.slot.key === "heroBackground"}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="px-6 py-4 space-y-4 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary shrink-0">
                  Zoom
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCropper}
                  disabled={busy}
                  className="px-5 py-2.5 border border-border bg-background text-text-primary hover:border-accent/40 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  disabled={busy || !croppedAreaPixels}
                  className="px-5 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-accent-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                >
                  <UploadCloud size={13} className={busy ? "animate-pulse" : ""} />
                  <span>{busy ? "Uploading…" : "Crop & Save"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
