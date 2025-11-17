"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Plus, Trash2, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "@/components/common/Toast";

interface AccessLink {
  title: string;
  url: string;
}

interface SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  price: number; // in dollars
  features: string[];
  welcomeMessage?: string;
  accessLinks?: AccessLink[];
  isActive: boolean;
}

const INTERVAL_OPTIONS = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export default function SubscriptionEditor() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing subscription plans
  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const res = await fetch(`/api/mentor/subscriptions`);
      const data = await res.json();

      if (data.ok && data.data.plans) {
        // Convert prices from cents to dollars for display
        const plansInDollars = (data.data.plans as SubscriptionPlan[]).map((plan) => ({
          ...plan,
          price: plan.price / 100,
        }));
        setPlans(plansInDollars);
      }
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      toast("Failed to load subscription plans", "error");
    } finally {
      setLoading(false);
    }
  }

  const addPlan = () => {
    const newPlan: SubscriptionPlan = {
      name: "",
      description: "",
      interval: "MONTHLY",
      price: 0,
      features: [""],
      welcomeMessage: "",
      accessLinks: [],
      isActive: true,
    };
    setPlans([...plans, newPlan]);
  };

  const updatePlan = (
    index: number,
    field: keyof SubscriptionPlan,
    value: string | number | boolean | string[]
  ) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlans(updatedPlans);
  };

  const removePlan = async (index: number) => {
    const plan = plans[index];

    if (plan.id) {
      // If plan exists in database, mark it as inactive
      const confirmed = confirm(
        "Are you sure you want to delete this subscription plan? Active subscribers will keep their access until their subscription ends."
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/mentor/subscriptions/${plan.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete plan");
        }

        toast("Subscription plan deleted", "success");
        setPlans(plans.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Failed to delete plan:", error);
        toast("Failed to delete subscription plan", "error");
      }
    } else {
      // If plan doesn't exist yet, just remove from state
      setPlans(plans.filter((_, i) => i !== index));
    }
  };

  const addFeature = (planIndex: number) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features.push("");
    setPlans(updatedPlans);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features[featureIndex] = value;
    setPlans(updatedPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter(
      (_, i) => i !== featureIndex
    );
    setPlans(updatedPlans);
  };

  const addAccessLink = (planIndex: number) => {
    const updatedPlans = [...plans];
    if (!updatedPlans[planIndex].accessLinks) {
      updatedPlans[planIndex].accessLinks = [];
    }
    updatedPlans[planIndex].accessLinks!.push({ title: "", url: "" });
    setPlans(updatedPlans);
  };

  const updateAccessLink = (
    planIndex: number,
    linkIndex: number,
    field: "title" | "url",
    value: string
  ) => {
    const updatedPlans = [...plans];
    if (updatedPlans[planIndex].accessLinks) {
      updatedPlans[planIndex].accessLinks![linkIndex][field] = value;
      setPlans(updatedPlans);
    }
  };

  const removeAccessLink = (planIndex: number, linkIndex: number) => {
    const updatedPlans = [...plans];
    if (updatedPlans[planIndex].accessLinks) {
      updatedPlans[planIndex].accessLinks = updatedPlans[planIndex].accessLinks!.filter(
        (_, i) => i !== linkIndex
      );
      setPlans(updatedPlans);
    }
  };

  const handleSave = async () => {
    // Validation
    for (const plan of plans) {
      if (!plan.name.trim()) {
        toast("Please provide a name for all subscription plans", "error");
        return;
      }
      if (plan.price <= 0) {
        toast("Subscription price must be greater than $0", "error");
        return;
      }
      if (plan.features.length === 0 || plan.features.every((f) => !f.trim())) {
        toast("Please add at least one feature for each plan", "error");
        return;
      }
    }

    setSaving(true);
    try {
      // Convert prices from dollars to cents
      const plansInCents = plans.map((plan) => ({
        ...plan,
        price: Math.round(plan.price * 100),
        features: plan.features.filter((f) => f.trim()), // Remove empty features
        accessLinks: plan.accessLinks?.filter((l) => l.title.trim() && l.url.trim()) || [], // Remove empty links
      }));

      const res = await fetch("/api/mentor/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans: plansInCents }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save subscription plans");
      }

      toast("Subscription plans saved successfully!", "success");
      await fetchPlans(); // Refresh plans to get IDs
    } catch (error) {
      console.error("Failed to save subscription plans:", error);
      toast(
        error instanceof Error ? error.message : "Failed to save subscription plans",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            <p className="mt-4 text-white/60">Loading subscription plans...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent>
          <h3 className="mb-2 text-lg font-semibold">Subscription Plans</h3>
          <p className="text-sm text-white/60">
            Create recurring subscription tiers for your students. They&apos;ll be charged
            automatically based on the interval you choose (weekly, monthly, or yearly).
          </p>
        </CardContent>
      </Card>

      {/* Plans List */}
      {plans.length === 0 ? (
        <Card>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-white/10 p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-white/40" />
              <p className="mt-4 text-white/60">No subscription plans yet</p>
              <p className="mt-2 text-sm text-white/40">
                Click &quot;Add Subscription Plan&quot; to create your first recurring subscription tier
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan, planIndex) => (
            <Card key={planIndex}>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white/90">
                    Plan {planIndex + 1}
                  </h4>
                  <button
                    onClick={() => removePlan(planIndex)}
                    className="rounded-md p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Plan Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updatePlan(planIndex, "name", e.target.value)}
                      placeholder="e.g., Weekly Check-ins, Monthly Coaching"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Description
                    </label>
                    <textarea
                      value={plan.description}
                      onChange={(e) => updatePlan(planIndex, "description", e.target.value)}
                      placeholder="Brief description of what this subscription includes"
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  {/* Interval & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Interval */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Billing Interval *
                      </label>
                      <select
                        value={plan.interval}
                        onChange={(e) =>
                          updatePlan(
                            planIndex,
                            "interval",
                            e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY"
                          )
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        {INTERVAL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Price ($) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={plan.price || ""}
                          onChange={(e) =>
                            updatePlan(planIndex, "price", parseFloat(e.target.value) || 0)
                          }
                          placeholder="49.99"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-white/80">
                        Features *
                      </label>
                      <Button
                        onClick={() => addFeature(planIndex)}
                        size="sm"
                        variant="ghost"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Feature
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2">
                          <div className="relative flex-1">
                            <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) =>
                                updateFeature(planIndex, featureIndex, e.target.value)
                              }
                              placeholder="e.g., Weekly 1:1 video calls"
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                          </div>
                          {plan.features.length > 1 && (
                            <button
                              onClick={() => removeFeature(planIndex, featureIndex)}
                              className="rounded-md p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Remove feature"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Welcome Message
                    </label>
                    <textarea
                      value={plan.welcomeMessage || ""}
                      onChange={(e) => updatePlan(planIndex, "welcomeMessage", e.target.value)}
                      placeholder="Write a welcome message for new subscribers (shown on success page)"
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <p className="mt-1 text-xs text-white/50">
                      This message will be shown to students after they subscribe
                    </p>
                  </div>

                  {/* Access Links */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-white/80">
                        Access Links & Resources
                      </label>
                      <Button
                        onClick={() => addAccessLink(planIndex)}
                        size="sm"
                        variant="ghost"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Link
                      </Button>
                    </div>

                    {plan.accessLinks && plan.accessLinks.length > 0 && (
                      <div className="space-y-2">
                        {plan.accessLinks.map((link, linkIndex) => (
                          <div key={linkIndex} className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) =>
                                  updateAccessLink(planIndex, linkIndex, "title", e.target.value)
                                }
                                placeholder="Link title (e.g., Discord Community)"
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              />
                              <button
                                onClick={() => removeAccessLink(planIndex, linkIndex)}
                                className="rounded-md p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remove link"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) =>
                                updateAccessLink(planIndex, linkIndex, "url", e.target.value)
                              }
                              placeholder="https://discord.gg/..."
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-white/50">
                      Add links to Discord, Telegram, Google Drive, or other resources for subscribers
                    </p>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                    <div>
                      <p className="font-medium text-white/90">Plan Status</p>
                      <p className="text-sm text-white/60">
                        {plan.isActive
                          ? "Active - visible to students"
                          : "Inactive - hidden from students"}
                      </p>
                    </div>
                    <button
                      onClick={() => updatePlan(planIndex, "isActive", !plan.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        plan.isActive ? "bg-purple-600" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          plan.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={addPlan} variant="ghost">
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription Plan
        </Button>
        {plans.length > 0 && (
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save All Plans"}
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardContent>
          <h3 className="mb-2 text-lg font-semibold text-purple-300">
            💡 How subscriptions work
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Students subscribe and are charged automatically each billing cycle</li>
            <li>• You receive 85% of the subscription price (15% platform fee)</li>
            <li>• Students can cancel anytime - they keep access until the end of their billing period</li>
            <li>• Subscription revenue follows the same payout schedule as sessions (7-day hold for new mentors, 2-day for trusted mentors)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
