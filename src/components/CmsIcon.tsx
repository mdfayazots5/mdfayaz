import React from "react";
import { Layers, type LucideIcon, type LucideProps } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";

/**
 * Renders a CMS-chosen lucide icon by its PascalCase name (e.g. "Server", "Link2").
 * Icons load on demand (one tiny chunk each) instead of bundling the whole lucide set,
 * which `import * as Icons from "lucide-react"` used to do. Unknown names → `fallback`.
 */
const KNOWN = new Set<string>(iconNames);

const toKebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

interface CmsIconProps extends Omit<LucideProps, "ref"> {
  name?: string;
  fallback?: LucideIcon;
}

export const CmsIcon: React.FC<CmsIconProps> = ({ name, fallback: Fallback = Layers, ...props }) => {
  const key = name ? toKebab(name.trim()) : "";
  if (!KNOWN.has(key)) return <Fallback {...props} />;
  return <DynamicIcon name={key as IconName} fallback={() => <Fallback {...props} />} {...props} />;
};
