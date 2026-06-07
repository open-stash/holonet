"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsPageHeader } from "@/components/settings/settings-page-header";
import { cn } from "@/lib/utils";

type PlanId = "free" | "pro" | "max";
type BillingPeriod = "monthly" | "annual";

interface Plan {
  id: PlanId;
  name: string;
  icon: LucideIcon;
  tagline: string;
  priceMonthly: number; // USD / month, billed monthly
  priceAnnual: number; // USD / month, billed annually
  features: string[];
  highlight?: boolean;
}

// Placeholder pricing + features — tweak these freely.
const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    icon: Sparkles,
    tagline: "For getting your second brain started.",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      "Up to 8 collections",
      "$2 of AI usage / month",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    tagline: "For power users who save every day.",
    priceMonthly: 9,
    priceAnnual: 7,
    highlight: true,
    features: [
      "Up to 40 collections",
      "$18 of AI usage / month",
    ],
  },
  {
    id: "max",
    name: "Max",
    icon: Crown,
    tagline: "Everything, unlimited, top models.",
    priceMonthly: 20,
    priceAnnual: 16,
    features: [
      "Unlimited collections",
      "$120 of AI usage / month",
    ],
  },
];

// The user's active plan — wire to the real subscription later.
const currentPlan: PlanId = "free";

function priceFor(plan: Plan, period: BillingPeriod) {
  return period === "annual" ? plan.priceAnnual : plan.priceMonthly;
}

export function BillingSettingsPanel() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="flex flex-1 flex-col p-8">
      <SettingsPageHeader
        title="Billing"
        description="Choose the plan that fits how much you stash."
      />

      {/* Current plan + billing period toggle */}
      <div className="mb-6 flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          You&apos;re on the{" "}
          <span className="font-semibold capitalize text-slate-900">
            {currentPlan}
          </span>{" "}
          plan.
        </p>

        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(["monthly", "annual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                period === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {p}
              {p === "annual" && (
                <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid max-w-5xl gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = priceFor(plan, period);
          const isCurrent = plan.id === currentPlan;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border bg-white p-5",
                plan.highlight
                  ? "border-slate-900 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)]"
                  : "border-slate-200/80"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    plan.highlight
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  {plan.name}
                </h3>
              </div>

              <p className="mt-2 text-xs text-slate-500">{plan.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">
                  ${price}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              {period === "annual" && price > 0 && (
                <p className="mt-1 text-[11px] text-slate-400">
                  billed annually
                </p>
              )}

              <ul className="mt-5 flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-slate-600"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-2">
                <Button
                  className="w-full"
                  variant={
                    isCurrent
                      ? "outline"
                      : plan.highlight
                        ? "default"
                        : "secondary"
                  }
                  disabled={isCurrent}
                >
                  {isCurrent
                    ? "Current plan"
                    : plan.id === "free"
                      ? "Downgrade"
                      : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-5xl text-[11px] text-slate-400">
        Plans renew automatically. You can change or cancel anytime — changes take
        effect at the end of the current billing cycle.
      </p>
    </div>
  );
}
