import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle, AlertCircle, Loader2, Building2, User2, Mail, MessageSquare, Phone } from "lucide-react";

interface ContactFormProps {
  candidateEmail: string;
}

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiryType: string;
  roleInterest: string;
  message: string;
  // Honeypot: real users never see or fill this. A non-empty value means a bot.
  botcheck: string;
}

const INQUIRY_TYPES = [
  { value: "direct_hire", label: "Direct Hire Opportunity" },
  { value: "contract_consulting", label: "Contract & Technical Consulting" },
  { value: "architectural_review", label: "System Architecture Audit" },
  { value: "general_inquiry", label: "Other / General Inquiry" }
];

const ROLE_INTERESTS = [
  { value: "system_architect", label: "System Architect" },
  { value: "team_lead", label: "Technical Team Lead" },
  { value: "senior_dotnet", label: "Senior .NET & Full-Stack Developer" },
  { value: "not_specified", label: "Not Sure / General Recruitment" }
];

/** Resolve a stored select value (e.g. "direct_hire") to its human label. */
const labelFor = (options: { value: string; label: string }[], value: string): string =>
  options.find((o) => o.value === value)?.label || value;

export const ContactForm: React.FC<ContactFormProps> = ({ candidateEmail }) => {
  const [formData, setFormData] = React.useState<FormState>({
    name: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "direct_hire",
    roleInterest: "system_architect",
    message: "",
    botcheck: ""
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const web3FormsAccessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY || "";

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please provide your name so Fayaz can address you correctly.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "An email address is required so we can get back to you.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid, deliverable email address.";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "A brief description of your inquiry helps Fayaz prepare thoroughly.";
    } else if (formData.message.trim().length < 15) {
      newErrors.message = "Please tell us a bit more (minimum 15 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      inquiryType: "direct_hire",
      roleInterest: "system_architect",
      message: "",
      botcheck: ""
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Honeypot: a filled hidden field means a bot. Silently accept and drop —
    // showing the same success screen so the bot gets no signal to adapt.
    if (formData.botcheck) {
      setStatus("success");
      resetForm();
      return;
    }

    // Web3Forms requires a valid access key. Without one, the request is
    // guaranteed to 400 — so fail fast with a clear message instead of
    // dispatching a doomed submission.
    if (!web3FormsAccessKey) {
      setStatus("error");
      setErrorMessage(
        "Contact form is not fully configured yet. Please email me directly at " +
          candidateEmail + "."
      );
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const inquiryLabel = labelFor(INQUIRY_TYPES, formData.inquiryType);
    const roleLabel = labelFor(ROLE_INTERESTS, formData.roleInterest);

    try {
      const payload = {
        access_key: web3FormsAccessKey,
        // Web3Forms honeypot: its server drops the submission if this is truthy.
        botcheck: false,
        subject: `[Portfolio Contact] ${formData.name}${formData.company ? " · " + formData.company : ""} — ${inquiryLabel}`,
        from_name: formData.name,
        email: formData.email,
        // Structured fields render as their own rows in the notification email
        // and become filterable columns in the Web3Forms Submissions dashboard.
        name: formData.name,
        company: formData.company || "Not provided",
        phone: formData.phone || "Not provided",
        inquiry_type: inquiryLabel,
        desired_role: roleLabel,
        // Clean, trimmed body — no stray leading newline or trailing whitespace.
        message: [
          `Name: ${formData.name}`,
          `Email: ${formData.email}`,
          `Phone: ${formData.phone || "Not provided"}`,
          `Company / Organization: ${formData.company || "Not provided"}`,
          `Engagement Context: ${inquiryLabel}`,
          `Target Role: ${roleLabel}`,
          "",
          "Message:",
          formData.message.trim(),
        ].join("\n"),
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus("success");
        resetForm();
        // Fire an optional analytics conversion event (no-op if no provider).
        try {
          (window as any).gtag?.("event", "contact_submitted", {
            inquiry_type: formData.inquiryType,
            desired_role: formData.roleInterest,
          });
          window.dispatchEvent(new CustomEvent("contact:submitted"));
        } catch {
          /* analytics is best-effort */
        }
      } else {
        throw new Error(result.message || "Failed to submit form. Please try again.");
      }
    } catch (err: any) {
      // Surface the real failure instead of faking success — otherwise a
      // recruiter sees "sent" while the message never reaches the inbox.
      console.error("Contact form submission failed:", err);
      setStatus("error");
      setErrorMessage(
        (err?.message || "Something went wrong while sending your message.") +
          ` You can also reach me directly at ${candidateEmail}.`
      );
    }
  };

  return (
    <div id="contact-form-container" className="w-full max-w-2xl mx-auto bg-surface rounded-3xl border border-border shadow-2xl shadow-text-secondary/5 p-8 lg:p-12 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/60 to-accent" />
      
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center py-8 space-y-6"
          >
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 animate-bounce">
              <CheckCircle size={48} className="stroke-[1.5px]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-luxury font-bold text-text-primary">Message Received</h3>
              <p className="text-text-secondary max-w-md text-sm leading-relaxed">
                Thank you for reaching out — your inquiry has landed in Fayaz's inbox. He personally reviews every message and typically replies within <strong className="text-text-primary">24 hours</strong> via your email or phone.
              </p>
            </div>

            {/* What happens next — sets expectations and offers a direct channel. */}
            <div className="w-full max-w-md bg-background border border-border rounded-2xl p-5 text-left text-xs text-text-secondary space-y-2">
              <p className="text-accent font-bold uppercase tracking-widest text-[10px]">What happens next</p>
              <p className="leading-relaxed">
                You'll get a personal reply within one business day. Prefer to move faster? Email directly at{" "}
                <a href={`mailto:${candidateEmail}`} className="text-text-primary font-semibold border-b border-border hover:border-accent hover:text-accent transition-colors">
                  {candidateEmail}
                </a>.
              </p>
            </div>

            <button
              onClick={() => setStatus("idle")}
              className="mt-4 px-6 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer"
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="contact-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 select-none"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-luxury font-bold text-text-primary tracking-tight">Initiate Technical Consultation</h3>
              <p className="text-xs text-text-secondary font-medium">
                Recruiters & Engineering Managers find optimal response times by detailing specific tech stacks and scope parameters.
              </p>
            </div>

            {/* Grid for Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <User2 size={12} className="text-text-secondary" />
                  Your Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah Jenkins"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none ${
                      errors.name 
                        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20" 
                        : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} className="text-text-secondary" />
                  Email Address <span className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. sjenkins@recruitment.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none ${
                    errors.email 
                      ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20" 
                      : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20"
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Grid for Company & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company / Agency */}
              <div className="space-y-2">
                <label htmlFor="company" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 size={12} className="text-text-secondary" />
                  Company / Organization
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Nexa Systems"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
              </div>

              {/* Phone (optional) */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Phone size={12} className="text-text-secondary" />
                  Phone <span className="text-text-secondary/50 normal-case tracking-normal font-medium">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 555 018 2394"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Grid for Inquiry Type & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inquiry Type */}
              <div className="space-y-2">
                <label htmlFor="inquiryType" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                  Engagement Context
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary transition-all duration-200 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 cursor-pointer"
                >
                  {INQUIRY_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-surface text-text-primary">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Interest (for recruiters) */}
              <div className="space-y-2">
                <label htmlFor="roleInterest" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                  Target Role Fit / Objective
                </label>
                <select
                  id="roleInterest"
                  name="roleInterest"
                  value={formData.roleInterest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary transition-all duration-200 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 cursor-pointer"
                >
                  {ROLE_INTERESTS.map((role) => (
                    <option key={role.value} value={role.value} className="bg-surface text-text-primary">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Box */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={12} className="text-text-secondary" />
                Inquiry Details <span className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe your architecture requirements, agile schedule timelines, compensation package models, or general technical queries..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none resize-none ${
                  errors.message 
                    ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20" 
                    : "border-border focus:border-accent focus:ring-1 focus:ring-accent/20"
                }`}
              />
              {errors.message && (
                <p id="message-error" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {errors.message}
                </p>
              )}
            </div>

            {/* Honeypot: hidden from humans; bots that auto-fill it are dropped. */}
            <input
              type="text"
              name="botcheck"
              value={formData.botcheck}
              onChange={handleInputChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {/* Error banner if general error occurs */}
            {errorMessage && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-500 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-4 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground disabled:bg-surface disabled:text-text-secondary/40 text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-text-secondary" />
                    <span>Sending your message…</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Strategic Inquiry</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-text-secondary/70 text-center leading-relaxed">
                Your details are used only to respond to this inquiry. See the{" "}
                <a href="#privacy" className="underline hover:text-accent transition-colors">privacy policy</a>.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
