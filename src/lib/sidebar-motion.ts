import type { Transition } from "framer-motion";

export const SIDEBAR_WIDTH_EXPANDED = 256;
export const SIDEBAR_WIDTH_COLLAPSED = 48;

export const sidebarSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.82,
};

export const sidebarTextSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 42,
  mass: 0.6,
};

export const sidebarFadeSpring: Transition = {
  type: "spring",
  stiffness: 460,
  damping: 40,
  mass: 0.55,
};

/** Snappy but stable — for small pill expand/collapse controls. */
export const pillExpandSpring: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.42,
};
