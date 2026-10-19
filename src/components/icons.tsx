import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const IconGrid = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 11V7a4 4 0 1 1 8 0v4l1 1.5H3L4 11Z" />
    <path d="M6.5 14h3" />
  </svg>
);
export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="6" cy="5.5" r="2.5" />
    <path d="M1.5 13.5c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5" />
    <path d="M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12 10.3c1.2.5 2 1.6 2.5 3.2" />
  </svg>
);
export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 1.8 13 3.6v4c0 3.2-2.1 5.5-5 6.6-2.9-1.1-5-3.4-5-6.6v-4l5-1.8Z" />
    <path d="m5.8 8 1.6 1.6L10.4 6.5" />
  </svg>
);
export const IconLogs = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 4h10M3 8h10M3 12h6" />
  </svg>
);
export const IconCog = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="2.2" />
    <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6" />
  </svg>
);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m13.5 13.5-3.2-3.2" />
  </svg>
);
export const IconChevron = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 6 3 3 3-3" />
  </svg>
);
export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 1.8 3.5 9H8l-1 5.2L12.5 7H8l1-5.2Z" />
  </svg>
);
export const IconSword = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M13.5 2.5 6 10M13.5 2.5h-3M13.5 2.5v3M4 9l3 3M3 13l2-2" />
  </svg>
);
export const IconCube = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 1.8 13.5 5v6L8 14.2 2.5 11V5L8 1.8Z" />
    <path d="M2.5 5 8 8.2 13.5 5M8 8.2v6" />
  </svg>
);
export const IconWind = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2 6h8.5a2 2 0 1 0-2-2M2 10h10.5a2 2 0 1 1-2 2M2 8h6" />
  </svg>
);
export const IconDiscord = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4A20.3 20.3 0 0 0 .1 18.1a19.9 19.9 0 0 0 6 3l1.3-2a13 13 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3 20.2 20.2 0 0 0-3.6-13.7ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
  </svg>
);
export const IconServer = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2" y="2.5" width="12" height="4.5" rx="1.2" />
    <rect x="2" y="9" width="12" height="4.5" rx="1.2" />
    <path d="M4.5 4.75h.01M4.5 11.25h.01" />
  </svg>
);
export const IconKey = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="5.5" cy="10.5" r="3" />
    <path d="m7.7 8.3 5.8-5.8M11.5 4.5l1.5 1.5M10 6l1.2 1.2" />
  </svg>
);
export const IconDownload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
  </svg>
);
export const IconCard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="1.8" y="3.5" width="12.4" height="9" rx="1.5" />
    <path d="M1.8 6.5h12.4M4.5 10h2" />
  </svg>
);
export const IconTicket = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2.5 3.5h11v9h-6l-3 2v-2h-2v-9Z" />
    <path d="M5 7h6M5 9.5h4" />
  </svg>
);
export const IconBox = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2.5 5 8 2.5 13.5 5v6L8 13.5 2.5 11V5Z" />
    <path d="M2.5 5 8 7.5 13.5 5M8 7.5v6" />
  </svg>
);
export const IconLogout = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6M10.5 11 13.5 8l-3-3M13.5 8H6" />
  </svg>
);
export const IconSliders = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 4h6M12 4h1M3 8h1M7 8h6M3 12h7M13 12h0" />
    <circle cx="10.5" cy="4" r="1.5" />
    <circle cx="5.5" cy="8" r="1.5" />
    <circle cx="11.5" cy="12" r="1.5" />
  </svg>
);
export const IconChart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5" />
  </svg>
);
export const IconCopy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
    <path d="M10.5 5V3.8a1.3 1.3 0 0 0-1.3-1.3H3.8a1.3 1.3 0 0 0-1.3 1.3v5.4a1.3 1.3 0 0 0 1.3 1.3H5" />
  </svg>
);
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);
