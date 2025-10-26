// components/layout/NavDropdown.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export type NavItem = {
  label: string;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
};

type TriggerElementProps = {
  onClick?: (e: React.MouseEvent) => void;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
};

type TriggerElement = React.ReactElement<TriggerElementProps>;

export default function NavDropdown({
  trigger,
  items,
  signedInAs,
}: {
  trigger: TriggerElement | React.ReactNode;
  items: NavItem[];
  signedInAs?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const Trigger: React.ReactNode = React.isValidElement(trigger)
    ? React.cloneElement(trigger as TriggerElement, {
        onClick: (e: React.MouseEvent) => {
          const original = (trigger as TriggerElement).props.onClick;
          if (typeof original === "function") original(e);
          setOpen((v) => !v);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
      })
    : (
        <span
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
            if (e.key === "Escape") setOpen(false);
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex cursor-pointer items-center"
        >
          {trigger}
        </span>
      );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {Trigger}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-purple-500/30 bg-black/95 shadow-xl backdrop-blur-xl"
          style={{
            boxShadow: `
              0 0 20px rgba(168, 85, 247, 0.15),
              0 0 40px rgba(245, 158, 11, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          {signedInAs && (
            <>
              <div className="px-3 py-2">
                <p className="truncate text-xs text-purple-300/60">Signed in as</p>
                <p className="truncate text-sm font-medium text-white">{signedInAs}</p>
              </div>
              <div className="my-1 h-px bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-purple-500/20" />
            </>
          )}

          <ul className="py-1 text-sm text-neutral-200">
            {items.map((item) => {
              const base =
                "block w-full text-left px-3 py-2 hover:bg-white/5 focus:bg-white/5 focus:outline-none";
              if (item.href) {
                return (
                  <li key={item.label}>
                    <Link href={item.href} onClick={() => setOpen(false)} className={base} role="menuitem">
                      {item.label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      item.onSelect?.();
                    }}
                    className={`${base} ${item.danger ? "text-red-300 hover:bg-red-500/10" : ""}`}
                    role="menuitem"
                    type="button"
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
