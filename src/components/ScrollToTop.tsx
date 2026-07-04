import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const lenis = useLenis();

  React.useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      const nearBottom =
        window.innerHeight + scrolled >= document.documentElement.scrollHeight - 140;
      // Show after a bit of scroll, but hide near the very bottom so it never overlaps the footer.
      setIsVisible(scrolled > 500 && !nearBottom);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[9999] w-12 h-12 bg-accent text-accent-foreground rounded-full shadow-2xl flex items-center justify-center hover:bg-accent-hover transition-all group"
        >
          <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
