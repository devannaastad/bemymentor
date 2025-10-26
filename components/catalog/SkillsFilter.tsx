// components/catalog/SkillsFilter.tsx
"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/common/Badge";
import { X } from "lucide-react";
import { POPULAR_SKILLS } from "@/lib/utils/get-all-skills";

interface SkillsFilterProps {
  initialSkills?: string;
  onChange?: (skills: string) => void;
}

export default function SkillsFilter({ initialSkills = "", onChange }: SkillsFilterProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (!initialSkills) return [];
    return initialSkills.split(",").map((s) => s.trim()).filter(Boolean);
  });

  // Update hidden input when skills change
  useEffect(() => {
    if (onChange) {
      onChange(selectedSkills.join(","));
    }
  }, [selectedSkills, onChange]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      return [...prev, skill];
    });
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  return (
    <div className="grid gap-3">
      {/* Popular Skills - Quick Toggles */}
      <div>
        <p className="text-sm text-white/80 mb-2">Popular Skills</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div>
          <p className="text-sm text-white/80 mb-2">Selected ({selectedSkills.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="success"
                className="flex items-center gap-1 pr-1.5"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="skills" value={selectedSkills.join(",")} />
    </div>
  );
}
