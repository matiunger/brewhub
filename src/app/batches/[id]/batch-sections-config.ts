import type { LucideIcon } from "lucide-react";
import { BarChart2, Barrel, ClipboardList, Droplet, Filter, Flame, FlaskConical, GlassWater, Hop as HopIcon, Layers, Package, Settings2, Snowflake, Wheat, Wrench } from "lucide-react";

export type SectionKey = "basicInfo" | "equipment" | "recipeOverview" | "boil" | "waterVolumes" | "mash" | "fermentables" | "hops" | "cultures" | "water" | "bdPreparation" | "bdMilling" | "bdMash" | "bdSparge" | "bdPreboil" | "bdBoil" | "bdWhirlpool" | "bdFermentation" | "bdKegging" | "bdLagering" | "bdBottling" | "finalStatsOverview" | "finalStatsTiming" | "finalStatsTastings";

export const SECTION_DEFAULTS: Record<SectionKey, boolean> = {
  basicInfo: true,
  equipment: false,
  recipeOverview: true,
  boil: true,
  waterVolumes: true,
  mash: true,
  fermentables: true,
  hops: true,
  cultures: true,
  water: true,
  bdPreparation: true,
  bdMilling: true,
  bdMash: true,
  bdSparge: true,
  bdPreboil: true,
  bdBoil: true,
  bdWhirlpool: true,
  bdFermentation: true,
  bdKegging: true,
  bdLagering: true,
  bdBottling: true,
  finalStatsOverview: true,
  finalStatsTiming: true,
  finalStatsTastings: true,
};

export type BatchTab = "recipe" | "brewday" | "fermentation" | "results";

export const BATCH_TABS: { key: BatchTab; label: string; icon: LucideIcon }[] = [
  { key: "recipe",       label: "Recipe",       icon: ClipboardList },
  { key: "brewday",      label: "Brew Day",     icon: Flame },
  { key: "fermentation", label: "Fermentation", icon: FlaskConical },
  { key: "results",      label: "Results",      icon: BarChart2 },
];

export function parseTab(value: string | null): BatchTab {
  return BATCH_TABS.some((t) => t.key === value) ? (value as BatchTab) : "recipe";
}

export const SECTION_NAV: {
  group: BatchTab;
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  hoverClass?: string;
}[] = [
  { group: "recipe", key: "basicInfo", label: "Basic Information", icon: ClipboardList },
  { group: "recipe", key: "equipment", label: "Equipment", icon: Wrench },
  { group: "recipe", key: "recipeOverview", label: "Recipe Overview", icon: BarChart2 },
  { group: "recipe", key: "fermentables", label: "Fermentables", icon: Wheat, hoverClass: "hover:text-orange-700 hover:bg-orange-50" },
  { group: "recipe", key: "hops", label: "Hops", icon: HopIcon, hoverClass: "hover:text-lime-700 hover:bg-lime-50" },
  { group: "recipe", key: "cultures", label: "Cultures", icon: FlaskConical, hoverClass: "hover:text-purple-700 hover:bg-purple-50" },
  { group: "recipe", key: "boil", label: "Boil", icon: Flame },
  { group: "recipe", key: "mash", label: "Mash", icon: Layers },
  { group: "recipe", key: "waterVolumes", label: "Volumes", icon: GlassWater },
  { group: "recipe", key: "water", label: "Water", icon: Droplet, hoverClass: "hover:text-sky-700 hover:bg-sky-50" },
  { group: "brewday", key: "bdPreparation", label: "Preparation", icon: ClipboardList },
  { group: "brewday", key: "bdMilling", label: "Milling", icon: Settings2 },
  { group: "brewday", key: "bdMash", label: "Mash", icon: Layers },
  { group: "brewday", key: "bdSparge", label: "Lauter & Sparge", icon: Filter },
  { group: "brewday", key: "bdBoil", label: "Boil", icon: Flame },
  { group: "brewday", key: "bdWhirlpool", label: "Whirlpool & Chilling", icon: Snowflake },
  { group: "fermentation", key: "bdFermentation", label: "Fermentation", icon: FlaskConical },
  { group: "fermentation", key: "bdKegging", label: "Kegging & Carbonation", icon: Package },
  { group: "fermentation", key: "bdLagering", label: "Lagering", icon: Barrel },
  { group: "fermentation", key: "bdBottling", label: "Bottling", icon: GlassWater },
  { group: "results", key: "finalStatsOverview", label: "Overview", icon: BarChart2 },
  { group: "results", key: "finalStatsTiming", label: "Timing", icon: ClipboardList },
  { group: "results", key: "finalStatsTastings", label: "Tastings", icon: GlassWater },
];

export function sectionAnchorId(key: SectionKey) {
  return `section-${key}`;
}
