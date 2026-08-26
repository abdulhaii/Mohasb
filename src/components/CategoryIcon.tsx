import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Plane,
  Gift,
  Layers,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  Coins,
  ShieldCheck,
  Tag
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Plane,
  Gift,
  Layers,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  Coins,
  ShieldCheck,
  Tag,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent className={className} />;
};
