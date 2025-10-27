"use client";

import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Plus } from "lucide-react";

import { Mentor } from "@prisma/client";

interface PortfolioEditorProps {
  mentor: Mentor;
}

export default function PortfolioEditor({ mentor }: PortfolioEditorProps) {
  type PortfolioItem = { title: string; description: string; imageUrl?: string; link?: string; type: string };
  const portfolio: PortfolioItem[] = Array.isArray(mentor.portfolio)
    ? (mentor.portfolio as unknown as PortfolioItem[])
    : [];

  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Portfolio & Work Samples</h3>
            <p className="mt-1 text-sm text-white/60">
              Showcase your best work, case studies, and results
            </p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {portfolio.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-white/10 p-12 text-center">
            <p className="text-white/60">No portfolio items yet</p>
            <p className="mt-2 text-sm text-white/40">
              Click &quot;Add Item&quot; to showcase your work
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolio.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-1 text-sm text-white/70">{item.description}</p>
                <span className="mt-2 inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
