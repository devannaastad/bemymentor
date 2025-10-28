"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useProfileEditor } from "../ProfileEditorContext";

type PortfolioItem = {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  type: string;
};

export default function PortfolioEditor() {
  const { profileData, updateField } = useProfileEditor();
  const portfolio = profileData.portfolio || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: PortfolioItem = {
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      type: "Project",
    };
    updateField("portfolio", [...portfolio, newItem]);
    setEditingIndex(portfolio.length);
  };

  const removeItem = (index: number) => {
    updateField("portfolio", portfolio.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateItem = (index: number, field: keyof PortfolioItem, value: string) => {
    const updated = [...portfolio];
    updated[index] = { ...updated[index], [field]: value };
    updateField("portfolio", updated);
  };

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
          <Button size="sm" onClick={addItem}>
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
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/70">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        placeholder="Project name or achievement"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/70">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Describe the work, results, or impact..."
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-white/70">
                          Type
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(index, "type", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="Project">Project</option>
                          <option value="Case Study">Case Study</option>
                          <option value="Achievement">Achievement</option>
                          <option value="Video">Video</option>
                          <option value="Article">Article</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-white/70">
                          Link (optional)
                        </label>
                        <input
                          type="url"
                          value={item.link || ""}
                          onChange={(e) => updateItem(index, "link", e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/70">
                        Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={item.imageUrl || ""}
                        onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(null)}
                      >
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.title || "Untitled"}</h4>
                        <p className="mt-1 text-sm text-white/70">{item.description || "No description"}</p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            View Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <span className="mt-2 inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingIndex(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {portfolio.length > 0 && (
          <p className="mt-4 text-xs text-white/50">
            Remember to click &quot;Save Changes&quot; at the bottom to save your portfolio updates.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
