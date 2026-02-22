import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface ChartWrapperProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "orange" | "purple" | "pink" | "red" | "cyan" | "yellow";
}

const accentColors = {
  blue: "border-blue-500 bg-blue-50",
  green: "border-green-500 bg-green-50",
  orange: "border-orange-500 bg-orange-50",
  purple: "border-purple-500 bg-purple-50",
  pink: "border-pink-500 bg-pink-50",
  red: "border-red-500 bg-red-50",
  cyan: "border-cyan-500 bg-cyan-50",
  yellow: "border-yellow-500 bg-yellow-50",
};

const iconColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  red: "text-red-500",
  cyan: "text-cyan-500",
  yellow: "text-yellow-500",
};

export function ChartWrapper({
  title,
  icon: Icon,
  children,
  className,
  accentColor = "blue",
}: ChartWrapperProps) {
  return (
    <div
      className={cn(
        "border-l-4 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow",
        accentColors[accentColor],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={cn("w-5 h-5", iconColors[accentColor])} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
