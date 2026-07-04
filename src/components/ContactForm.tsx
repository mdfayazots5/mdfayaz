import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle, AlertCircle, Loader2, Building2, User2, Mail, MessageSquare, ChevronDown } from "lucide-react";

interface ContactFormProps {
  candidateEmail: string;
}

interface FormState {
  name: string;
  email: string;
  company: string;
  inquiryType: string;
  message: string;
  botcheck: string;
}

const INQUIRY_TYPES = [
  { value: "new_project", label: "New Project" },
  { value: "service_request", label: "Service Request" },
  { value: "technical_support", label: "Technical Support" },
  { value: "recruiter", label: "Recruiter / Hiring" },
  { value: "general_inquiry", label: "General Inquiry" },
];

const labelFor = (options: { value: string; label: string }[], value: string): string =>
  options.find((o) => o.value === value)?.label || value;

export const ContactForm: React.FC<ContactFormProps> = ({ candidateEmail }) => {
  const [formData, setFormData] = React.useState<FormState>({
    name: "",
    email: "",
    company: "",
    inquiryType: "new_project",
    message: "",
    botcheck: "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [purposeOpen, setPurposeOpen] = React.useState(false);

  const web3FormsAccessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY || "";

  const resetForm = () =>
    setFormData({
      name: "",
      email: "",
      company: "",
      inquiryType: "new_project",
      message: "",
      botcheck: "",
    });

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Please enter your name.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Please add a short message.";
    } else if (formData.message.trim().length < 15) {
      nextErrors.message = "Please add a little more detail.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.botcheck) {
      setStatus("success");
      resetForm();
      return;
    }

    if (!web3FormsAccessKey) {
      setStatus("error");
      setErrorMessage(`Contact form is not configured yet. Please email me directly at ${candidateEmail}.`);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    const inquiryLabel = labelFor(INQUIRY_TYPES, formData.inquiryType);

    try {
      const payload = {
        access_key: web3FormsAccessKey,
        botcheck: false,
        subject: `[Portfolio Contact] ${formData.name}${formData.company ? " - " + formData.company : ""} - ${inquiryLabel}`,
        from_name: formData.name,
        email: formData.email,
        name: formData.name,
        company: formData.company || "Not provided",
        inquiry_type: inquiryLabel,
        message: [
          `Name: ${formData.name}`,
          `Email: ${formData.email}`,
          `Company / Organization: ${formData.company || "Not provided"}`,
          `Purpose: ${inquiryLabel}`,
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
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit form. Please try again.");
      }

      setStatus("success");
      resetForm();
      try {
        (window as any).gtag?.("event", "contact_submitted", {
          inquiry_type: formData.inquiryType,
        });
        window.dispatchEvent(new CustomEvent("contact:submitted"));
      } catch {
        /* analytics is best-effort */
      }
    } catch (err: any) {
      console.error("Contact form submission failed:", err);
      setStatus("error");
      setErrorMessage(
        (err?.message || "Something went wrong while sending your message.") +
          ` You can also reach me directly at ${candidateEmail}.`,
      );
    }
  };

  return (
    <div id="contact-form-container" className="w-full max-w-2xl mx-auto bg-surface rounded-2xl border border-border shadow-2xl shadow-text-secondary/5 p-5 md:p-8 lg:p-10 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />

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
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
              <CheckCircle size={44} className="stroke-[1.5px]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-luxury font-bold text-text-primary">Message Sent</h3>
              <p className="text-text-secondary max-w-md text-sm leading-relaxed">
                Thanks for reaching out. Fayaz will reply by email as soon as possible.
              </p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 px-6 py-2.5 bg-text-primary text-background hover:bg-accent hover:text-accent-foreground text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer"
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="contact-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 select-none"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-luxury font-bold text-text-primary tracking-tight">Send a Message</h3>
              <p className="text-xs text-text-secondary font-medium leading-relaxed">
                Keep it simple: who you are, how to reply, and what you want to discuss.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <User2 size={12} className="text-text-secondary" />
                  Your Name <span className="text-accent">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none ${
                    errors.name ? "border-rose-400 focus:border-rose-500" : "border-border focus:border-accent"
                  }`}
                />
                {errors.name && (
                  <p id="name-error" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} className="text-text-secondary" />
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none ${
                    errors.email ? "border-rose-400 focus:border-rose-500" : "border-border focus:border-accent"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="company" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 size={12} className="text-text-secondary" />
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company or organization"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2 relative">
                <label id="purpose-label" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                  Purpose
                </label>
                <button
                  type="button"
                  aria-labelledby="purpose-label"
                  aria-haspopup="listbox"
                  aria-expanded={purposeOpen}
                  onClick={() => setPurposeOpen((value) => !value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text-primary transition-all duration-200 outline-none focus:border-accent cursor-pointer flex items-center justify-between gap-3 text-left"
                >
                  <span>{labelFor(INQUIRY_TYPES, formData.inquiryType)}</span>
                  <ChevronDown size={15} className={`text-text-secondary transition-transform ${purposeOpen ? "rotate-180" : ""}`} />
                </button>
                {purposeOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="purpose-label"
                    className="absolute left-0 right-0 top-full mt-2 z-30 bg-surface border border-border rounded-xl shadow-2xl p-1.5 text-sm"
                  >
                    {INQUIRY_TYPES.map((type) => {
                      const active = formData.inquiryType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, inquiryType: type.value }));
                            setPurposeOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                            active
                              ? "bg-accent text-accent-foreground"
                              : "text-text-secondary hover:text-text-primary hover:bg-background"
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={12} className="text-text-secondary" />
                Message <span className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="A short note about the role, project, or question..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm text-text-primary placeholder-text-secondary/40 transition-all duration-200 outline-none resize-none ${
                  errors.message ? "border-rose-400 focus:border-rose-500" : "border-border focus:border-accent"
                }`}
              />
              {errors.message && (
                <p id="message-error" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {errors.message}
                </p>
              )}
            </div>

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

            {errorMessage && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-500 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}

            <div className="pt-1 space-y-3">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-4 bg-text-primary hover:bg-accent text-background hover:text-accent-foreground disabled:bg-surface disabled:text-text-secondary/40 text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-text-secondary" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-text-secondary/70 text-center leading-relaxed">
                Your details are only used to respond to this message. See the{" "}
                <a href="#privacy" className="underline hover:text-accent transition-colors">privacy policy</a>.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
