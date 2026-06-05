"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { Home, Plus, Search, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pillExpandSpring } from "@/lib/sidebar-motion";
import { useChatStore, useSearchStore, useStashStore } from "@source/stores";

const ICON_SLOT = 36;
const TEXT_GAP = 6;
const PADDING_END = 14;

const navButtonClass =
  "flex h-9 shrink-0 items-center overflow-hidden rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

const MotionLink = motion.create(Link);

interface NavExpandControlProps {
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

function NavExpandControl({
  label,
  icon,
  ariaLabel,
  isActive = false,
  href,
  onClick,
}: NavExpandControlProps) {
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const textMeasureRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useLayoutEffect(() => {
    if (!textMeasureRef.current) return;
    setTextWidth(textMeasureRef.current.offsetWidth);
  }, [label]);

  const expanded = hovered;
  const expandedWidth = ICON_SLOT + TEXT_GAP + textWidth + PADDING_END;
  const widthTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : pillExpandSpring;

  const sharedProps = {
    "aria-label": ariaLabel ?? label,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    initial: false as const,
    animate: {
      width: textWidth > 0 && expanded ? expandedWidth : ICON_SLOT,
    },
    transition: widthTransition,
    className: cn(
      navButtonClass,
      isActive && "border-slate-300 bg-slate-50 text-slate-900"
    ),
  };

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center">
        {icon}
      </span>
      <motion.span
        initial={false}
        animate={{
          opacity: expanded ? 1 : 0,
          x: expanded ? 0 : -6,
          marginRight: expanded ? PADDING_END : 0,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                x: widthTransition,
                marginRight: widthTransition,
                opacity: {
                  duration: expanded ? 0.14 : 0.08,
                  delay: expanded ? 0.05 : 0,
                  ease: [0.22, 1, 0.36, 1],
                },
              }
        }
        style={{ marginLeft: TEXT_GAP }}
        className="shrink-0 overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    </>
  );

  return (
    <>
      <span
        ref={textMeasureRef}
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0 text-sm font-medium whitespace-nowrap"
      >
        {label}
      </span>

      {href ? (
        <MotionLink href={href} {...sharedProps}>
          {content}
        </MotionLink>
      ) : (
        <motion.button type="button" onClick={onClick} {...sharedProps}>
          {content}
        </motion.button>
      )}
    </>
  );
}

export function DashboardTopNavbar() {
  const pathname = usePathname();
  const setSearchOpen = useSearchStore((state) => state.setOpen);
  const setStashOpen = useStashStore((state) => state.setOpen);
  const newChat = useChatStore((state) => state.newChat);
  const hasChatMessages = useChatStore((state) => state.messages.length > 0);
  const isHome = pathname === "/dashboard";
  const showNewChat = isHome && hasChatMessages;

  return (
    <header className="relative flex shrink-0 items-center justify-center px-4 py-3">
      <div className="flex items-center gap-2">
        <NavExpandControl
          label="Home"
          href="/dashboard"
          isActive={isHome}
          ariaLabel="Home"
          icon={<Home className="size-4 shrink-0" strokeWidth={2} />}
        />

        <NavExpandControl
          label="Stash"
          onClick={() => setStashOpen(true)}
          icon={<Plus className="size-4 shrink-0" strokeWidth={2.25} />}
        />

        <NavExpandControl
          label="Search"
          onClick={() => setSearchOpen(true)}
          ariaLabel="Quick search"
          icon={<Search className="size-4 shrink-0" strokeWidth={2} />}
        />
      </div>

      {showNewChat ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={newChat}
          className="absolute right-4 gap-1.5 text-muted-foreground"
        >
          <SquarePen className="size-4" />
          New chat
        </Button>
      ) : null}
    </header>
  );
}
