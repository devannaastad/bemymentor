// components/mentor-setup/ProfileCompleteness.tsx
import { calculateProfileCompleteness } from "@/lib/utils/profile-completeness";
import type { Mentor } from "@prisma/client";

interface ProfileCompletenessProps {
  mentor: Partial<Mentor>;
}

export default function ProfileCompleteness({ mentor }: ProfileCompletenessProps) {
  const { percentage, missingFields } = calculateProfileCompleteness(mentor);

  const getColor = () => {
    if (percentage === 100) return "text-emerald-400";
    if (percentage >= 75) return "text-blue-400";
    if (percentage >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getBgColor = () => {
    if (percentage === 100) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">Profile Completeness</h3>
        <span className={`text-lg font-bold ${getColor()}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full transition-all ${getBgColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="text-xs text-white/60">
          <p className="mb-1 font-medium">Missing fields:</p>
          <ul className="space-y-0.5">
            {missingFields.map((field) => (
              <li key={field}>• {field}</li>
            ))}
          </ul>
        </div>
      )}

      {percentage === 100 && (
        <p className="text-xs text-emerald-400">
          ✓ Your profile is complete!
        </p>
      )}
    </div>
  );
}
