import type React from 'react';
import {
  Utensils, Bus, ShoppingBag, GraduationCap, Popcorn, HeartPulse, Dumbbell,
  Receipt, Home, MoreHorizontal, Wallet, LayoutGrid, Calendar as CalendarIcon,
  BarChart3, FileText, Settings as SettingsIcon, Plus, ChevronDown, X, Search,
  Pencil, Trash2, Download, Printer, Upload, AlertTriangle, CheckCircle2,
  Info, ArrowUpDown, Filter, Wallet2, TrendingUp, TrendingDown, CalendarDays,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  bus: Bus,
  'shopping-bag': ShoppingBag,
  'graduation-cap': GraduationCap,
  popcorn: Popcorn,
  'heart-pulse': HeartPulse,
  dumbbell: Dumbbell,
  receipt: Receipt,
  home: Home,
  'more-horizontal': MoreHorizontal,
  wallet: Wallet,
};

export function CategoryIcon({
  icon,
  className,
  style,
}: {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = CATEGORY_ICONS[icon] ?? MoreHorizontal;
  return <Icon className={className} style={style} />;
}

export {
  LayoutGrid, CalendarIcon, BarChart3, FileText, SettingsIcon, Plus, ChevronDown,
  X, Search, Pencil, Trash2, Download, Printer, Upload, AlertTriangle,
  CheckCircle2, Info, ArrowUpDown, Filter, Wallet2, TrendingUp, TrendingDown,
  CalendarDays,
};
