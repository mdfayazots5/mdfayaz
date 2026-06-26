import React from "react";
import * as Icons from "lucide-react";
import { Service } from "../models/portfolio.model";

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onViewDetails }) => {
  // Safe dynamic lucide-react icon rendering
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-6 h-6 text-accent" />;
    }
    return <Icons.HelpCircle className="w-6 h-6 text-accent" />;
  };

  const isActive = service.status === "Active";

  return (
    <div
      id={`service-card-${service.id}`}
      className={`flex flex-col justify-between h-full bg-surface border border-border rounded-3xl p-6 md:p-8 hover:border-accent/55 hover:shadow-lg transition-all duration-300 text-left relative ${
        !isActive ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <div className="space-y-5">
        {/* Top Header Row with Icon and Status pill */}
        <div className="flex items-center justify-between">
          <div className="p-3 bg-background border border-border rounded-2xl shadow-sm flex items-center justify-center">
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

        {/* Headings */}
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-bold text-text-primary tracking-tight font-luxury">
            {service.name}
          </h3>
          <p className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
            Display Order: {service.displayOrder}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-sm text-text-secondary leading-relaxed font-normal">
          {service.tagline}
        </p>
      </div>

      {/* View Details Action Trigger */}
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(service)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest cursor-pointer"
        >
          <Icons.Info size={13} />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};
