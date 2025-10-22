import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function AnalyticsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/60 text-sm mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {subtitle && (
              <p className="text-white/40 text-xs">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-white/40">vs last month</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
