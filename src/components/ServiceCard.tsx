import React from "react";
import * as Icons from "lucide-react";
import { Service } from "../models/portfolio.model";

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    const closeWhenAnotherOpens = (event: Event) => {
      const activeId = (event as CustomEvent<number>).detail;
      if (activeId !== service.id) {
        setExpanded(false);
      }
    };
    window.addEventListener("service-card:preview", closeWhenAnotherOpens);
    return () => window.removeEventListener("service-card:preview", closeWhenAnotherOpens);
  }, [service.id]);

  const toggleExpanded = () => {
    setExpanded((current) => {
      const next = !current;
      if (next) {
        window.dispatchEvent(new CustomEvent("service-card:preview", { detail: service.id }));
      }
      return next;
    });
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-6 h-6 text-accent" />;
    }
    return <Icons.HelpCircle className="w-6 h-6 text-accent" />;
  };

  const isActive = service.status === "Active";

  return (
    <article
      id={`service-card-${service.id}`}
      tabIndex={0}
      aria-expanded={expanded}
      onClick={toggleExpanded}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleExpanded();
        }
      }}
      className={`flex flex-col h-full bg-surface border border-border rounded-xl p-4 md:p-5 hover:border-accent/55 focus:border-accent/55 hover:shadow-md focus:shadow-md outline-none transition-all duration-300 text-left cursor-pointer ${
        !isActive ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="p-2.5 bg-background border border-border rounded-lg shadow-sm flex items-center justify-center">
            {renderIcon(service.icon)}
          </div>

          <span
            className={`px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg border ${
              isActive
                ? "bg-accent/10 text-accent border-accent/25"
                : "bg-text-secondary/15 text-text-secondary border-border"
            }`}
          >
            {service.status}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg md:text-xl font-bold text-text-primary tracking-tight font-luxury leading-tight">
            {service.name}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed font-normal">
            {service.tagline}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
            <span>Click for scope</span>
            <Icons.ChevronDown
              size={13}
              className={`transition-transform duration-300 ${expanded ? "rotate-180 text-accent" : ""}`}
            />
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden space-y-4 border-t border-border pt-4">
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
            {service.description}
          </p>

          {service.highlights && service.highlights.length > 0 && (
            <ul className="space-y-2">
              {service.highlights.slice(0, 4).map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary font-medium leading-relaxed">
                  <Icons.CheckCircle size={13} className="text-accent shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
};
