import React, { useEffect, useState } from "react";
import { Sparkles, HelpCircle, Layers } from "lucide-react";
import { Service } from "../models/portfolio.model";
import { getServices } from "../services/api";
import { ServiceCard } from "./ServiceCard";
import { ServiceDetailModal } from "./ServiceDetailModal";

interface ServicesPageProps {
  showOnlyGrid?: boolean;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ showOnlyGrid = false }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getServices()
      .then((data) => {
        if (isMounted) {
          // Sort active services first, then inactive, then displayOrder ascending
          const sorted = [...(data || [])].sort((a, b) => {
            if (a.status === "Active" && b.status !== "Active") return -1;
            if (a.status !== "Active" && b.status === "Active") return 1;
            return (a.displayOrder || 0) - (b.displayOrder || 0);
          });
          setServices(sorted);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch services in public page:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDetails = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-background select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">Retrieving expertise nodes...</span>
        </div>
      </div>
    );
  }

  const activeCount = services.filter((s) => s.status === "Active").length;
  const totalCount = services.length;

  if (showOnlyGrid) {
    return (
      <div className="animate-fade-in w-full">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          {services.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-sm mx-auto space-y-4">
              <HelpCircle className="w-8 h-8 text-text-secondary/50 mx-auto" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No services listed</h3>
              <p className="text-xs text-text-secondary leading-relaxed">No custom consulting services or expertise domains are configured at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onViewDetails={handleOpenDetails} 
                />
              ))}
            </div>
          )}
        </main>

        {selectedService && (
          <ServiceDetailModal
            service={selectedService}
            isOpen={isModalOpen}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    );
  }

  return (
    <div id="services-section" className="bg-background min-h-screen pb-24">
      {/* Header section matching the #products header design */}
      <header className="relative py-24 lg:py-32 px-8 lg:px-24 bg-surface/40 border-b border-border text-center overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-[20vw] font-luxury font-black text-text-secondary/15 select-none uppercase">EXPERTISE</span>
        </div>
        <div className="z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center text-left">
          {/* Main Title & Subtitle */}
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold text-accent uppercase tracking-[0.3em] bg-background border border-border rounded-full">
              <Sparkles size={11} className="text-accent" />
              Areas of Expertise
            </span>
            <h1 className="text-4xl lg:text-5xl font-luxury font-light tracking-tighter leading-tight text-text-primary">
              Services
            </h1>
            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-xl">
              Explore my technical expertise and what I can help with. Professional software architecture consulting, API implementation, and technical problem solving.
            </p>
          </div>

          {/* Quick Stats overview box */}
          <div className="hidden lg:block bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest">
                Service Catalog Info
              </span>
              <Layers size={13} className="text-accent" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-luxury font-bold text-text-primary">
                {activeCount}
              </span>
              <span className="text-xs font-semibold text-text-secondary font-mono uppercase tracking-wider">
                Active Offerings
              </span>
            </div>

            <p className="text-[10px] font-mono text-text-secondary">
              Reliable enterprise engineering capabilities backing up {totalCount} discrete modular domains.
            </p>
          </div>
        </div>
      </header>

      {/* Grid containing services */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-16">
        {services.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-border rounded-3xl bg-surface/20 max-w-sm mx-auto space-y-4">
            <HelpCircle className="w-8 h-8 text-text-secondary/50 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">No services listed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">No custom consulting services or expertise domains are configured at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onViewDetails={handleOpenDetails} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Details View modal layer */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={isModalOpen}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};
