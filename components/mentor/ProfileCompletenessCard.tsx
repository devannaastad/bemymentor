// components/mentor/ProfileCompletenessCard.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/common/Card";
import type { Mentor } from "@prisma/client";
import {
  calculateProfileCompleteness,
  getCompletenessColor,
  getCompletenessProgressColor,
} from "@/lib/utils/profile-completeness";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import Button from "@/components/common/Button";

interface ProfileCompletenessCardProps {
  mentor: Mentor;
}

export default function ProfileCompletenessCard({ mentor }: ProfileCompletenessCardProps) {
  const { percentage, items } = useMemo(() => calculateProfileCompleteness(mentor), [mentor]);

  const incompleteItems = items.filter((item) => !item.completed).sort((a, b) => b.weight - a.weight);
  const completedItems = items.filter((item) => item.completed);

  const percentageColor = getCompletenessColor(percentage);
  const progressColor = getCompletenessProgressColor(percentage);

  if (percentage === 100) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Profile Complete!</h3>
              <p className="text-white/70 text-sm">
                Your profile is 100% complete. You&apos;re all set to start receiving bookings!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Profile Completeness</h3>
              </div>
              <p className="text-sm text-white/60">
                Complete your profile to attract more students
              </p>
            </div>
            <div className={`text-2xl font-bold ${percentageColor}`}>
              {percentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 ${progressColor} transition-all duration-500 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Completion Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-white/70">
                {completedItems.length} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-white/40" />
              <span className="text-white/70">
                {incompleteItems.length} remaining
              </span>
            </div>
          </div>

          {/* Incomplete Items */}
          {incompleteItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold text-white/80">Next Steps:</h4>
              <div className="space-y-2">
                {incompleteItems.slice(0, 5).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Circle className="h-4 w-4 text-white/40 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{item.label}</div>
                      <div className="text-xs text-white/60 mt-0.5">{item.description}</div>
                    </div>
                    {item.link && (
                      <Button
                        href={item.link}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 text-xs"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {incompleteItems.length > 5 && (
                <p className="text-xs text-white/50 pt-2">
                  +{incompleteItems.length - 5} more items to complete
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
