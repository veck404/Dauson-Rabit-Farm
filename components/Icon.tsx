import type { SVGProps } from "react";

type IconName =
  | "grid" | "rabbit" | "heart" | "dna" | "wheat" | "wallet" | "report"
  | "settings" | "search" | "plus" | "download" | "bell" | "chevron"
  | "trend" | "calendar" | "weight" | "menu" | "close" | "edit"
  | "trash" | "check" | "clock" | "box" | "arrow" | "more" | "filter"
  | "mail" | "lock" | "eye" | "eyeOff" | "logout";

const paths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  rabbit: <><path d="M13 16c0 3-2.2 5-5 5s-5-2-5-5 2.2-5 5-5c.7 0 1.4.1 2 .4"/><path d="M13 16c0-2.4 1.5-4.4 3.6-5.2M10 11c-.5-3.5.4-7.5 2.4-8 .9-.2 1.7 2.8 1.2 6M14 10c.5-3.5 2-6.8 3.8-6.6 1 .1 1 3.7-.2 7.4"/><circle cx="16.5" cy="13.5" r=".5" fill="currentColor"/><path d="M3.5 14.5 1.8 13"/></>,
  heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/><path d="M3.5 12h4l1.4-3 2.2 6 1.7-3H20"/></>,
  dna: <><path d="M4 4c5 0 11 16 16 16M20 4C15 4 9 20 4 20M7 7h10M6 17h12M9 11h6M9 14h6"/></>,
  wheat: <><path d="M12 21V9M12 13c-3.5 0-5-1.8-5-5 3.5 0 5 1.8 5 5ZM12 17c-3.5 0-5-1.8-5-5M12 9c3.5 0 5-1.8 5-5-3.5 0-5 1.8-5 5ZM12 13c3.5 0 5-1.8 5-5M12 17c3.5 0 5-1.8 5-5"/></>,
  wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13"/><path d="M20 10h-5a2 2 0 0 0 0 4h5M16 12h.01"/></>,
  report: <><path d="M5 3h11l3 3v15H5z"/><path d="M14 3v5h5M8 16l3-3 2 2 3-4M8 18h8"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>, download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>, trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  weight: <><path d="M5 9h14l2 12H3L5 9Z"/><path d="M9 9a3 3 0 0 1 6 0M12 13v3l2 1"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/></>,
  check: <path d="m5 12 4 4L19 6"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  box: <><path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5 9-5v9l-9 5-9-5Z"/></>, arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="m3 3 18 18M10.6 6.2A11.7 11.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1M10.3 10.3a2.5 2.5 0 0 0 3.4 3.4"/></>,
  logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M18 12H8"/></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
