import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Locks page scrolling while a modal/overlay is open.
 *
 * The app runs Lenis smooth-scroll at the root (see PortfolioApp), which also
 * governs the admin pages — so a plain `overflow: hidden` on the body is not
 * enough to stop the background from scrolling behind a modal. We freeze Lenis
 * instead, with a native overflow fallback for the brief window before Lenis is
 * ready. Modal scroll containers must carry `data-lenis-prevent` so their own
 * inner scrolling still works while the background stays put.
 */
export function useModalScrollLock(active: boolean): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!active) return;

    lenis?.stop();
    const body = document.body;
    const prevOverflow = body.style.overflow;
    if (!lenis) body.style.overflow = "hidden";

    return () => {
      lenis?.start();
      body.style.overflow = prevOverflow;
    };
  }, [active, lenis]);
}
