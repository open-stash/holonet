import { cn } from "@/lib/utils";

type LoaderAnimation = "loop" | "once" | "none";

interface AiChatLoaderProps {
  className?: string;
  /** "loop" pulses continuously (while working), "once" plays a single cycle (on click),
   * "none" is the static brand mark. Defaults to "loop". */
  animation?: LoaderAnimation;
}

const BAR_CLASS: Record<LoaderAnimation, string | undefined> = {
  loop: "animate-bar-pulse",
  once: "animate-bar-pulse-once",
  none: undefined,
};

/**
 * AiChatLoader — the stacked-bars brand mark. The wave comes from the per-rect
 * `animationDelay`; the `bar-pulse` keyframes live in globals.css.
 */
export function AiChatLoader({ className, animation = "loop" }: AiChatLoaderProps) {
  const barClass = BAR_CLASS[animation];
  return (
    <svg
      viewBox="0 0 189 166"
      fill="none"
      overflow="visible"
      role="img"
      aria-label={animation === "loop" ? "Loading" : "Assistant"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-auto", className)}
    >
      <g filter="url(#filter0_i_39_2)" overflow="visible">
        <rect className={barClass} x="8" y="17" width="173" height="31" rx="12" fill="#167CD7" />
      </g>
      <rect
        className={barClass}
        style={{ animationDelay: "0.2s" }}
        x="8"
        y="67"
        width="173"
        height="31"
        rx="12"
        fill="#6C9FF7"
        fillOpacity="0.8"
      />
      <g filter="url(#filter2_i_39_2)" overflow="visible">
        <rect
          className={barClass}
          style={{ animationDelay: "0.4s" }}
          x="8"
          y="117"
          width="173"
          height="31"
          rx="12"
          fill="#3F8AFF"
          fillOpacity="0.2"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_39_2"
          x="-12"
          y="-3"
          width="213"
          height="75"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_39_2" />
        </filter>
        <filter
          id="filter2_i_39_2"
          x="-12"
          y="97"
          width="213"
          height="75"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="50" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_39_2" />
        </filter>
      </defs>
    </svg>
  );
}
