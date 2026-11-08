import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  GlassWater,
  LayoutDashboard,
  PackageCheck,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Warehouse,
  Wine,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary, ModuleKey } from "./i18n";

export type NavItem = {
  href: string;
  icon: LucideIcon;
  /** "dashboard" or a module key in the dictionary */
  key: "dashboard" | ModuleKey;
};

export type NavGroup = {
  group: keyof Dictionary["groups"];
  items: NavItem[];
};

export const nav: NavGroup[] = [
  {
    group: "overview",
    items: [
      { href: "/", icon: LayoutDashboard, key: "dashboard" },
      { href: "/alerts", icon: Bell, key: "alerts" },
    ],
  },
  {
    group: "cellar",
    items: [
      { href: "/inventory", icon: Wine, key: "inventory" },
      { href: "/cellar", icon: Warehouse, key: "cellar" },
      { href: "/counts", icon: ClipboardCheck, key: "counts" },
      { href: "/movements", icon: ArrowLeftRight, key: "movements" },
      { href: "/by-the-glass", icon: GlassWater, key: "glass" },
    ],
  },
  {
    group: "purchasing",
    items: [
      { href: "/orders", icon: ShoppingCart, key: "orders" },
      { href: "/receiving", icon: PackageCheck, key: "receiving" },
      { href: "/suppliers", icon: Truck, key: "suppliers" },
    ],
  },
  {
    group: "sales",
    items: [
      { href: "/sales", icon: Receipt, key: "sales" },
      { href: "/wine-list", icon: BookOpen, key: "winelist" },
      { href: "/reports", icon: BarChart3, key: "reports" },
    ],
  },
  {
    group: "admin",
    items: [{ href: "/settings", icon: Settings, key: "settings" }],
  },
];

export function navLabel(t: Dictionary, key: NavItem["key"]) {
  return key === "dashboard" ? t.dashboard.title : t.modules[key].title;
}
