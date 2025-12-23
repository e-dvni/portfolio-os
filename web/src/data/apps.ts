export type AppType = "pdf" | "iframe" | "internal" | "external";

export type AppDef = {
  id: string;
  name: string;
  type: AppType;

  // Window behavior
  windowTitle: string;
  defaultSize: { w: number; h: number };
  desktop?: boolean;
  dock?: boolean;

  // Content behavior
  url?: string;      // iframe/external/pdf src
  internalKey?: string; // internal app renderer key

  // Icon
  icon: string; // path in /public/icons or /public/images
};

export const APPS: AppDef[] = [
  {
    id: "resume",
    name: "Resume.pdf",
    type: "pdf",
    windowTitle: "Resume.pdf",
    defaultSize: { w: 900, h: 650 },
    desktop: true,
    icon: "/icons/pdf.png",
    url: "/docs/Resume.pdf",
  },
  {
    id: "led-builder",
    name: "Custom LED Builder",
    type: "iframe",
    windowTitle: "Custom LED Builder — LED Jungle",
    defaultSize: { w: 1100, h: 720 },
    desktop: true,
    icon: "/icons/led.png",
    url: "https://led-jungle.com/pages/custom-text-led",
  },
  {
    id: "admin",
    name: "Admin Dashboard",
    type: "internal",
    windowTitle: "Admin Dashboard — Sign Avenue",
    defaultSize: { w: 1100, h: 720 },
    desktop: true,
    icon: "/icons/dashboard.png",
    internalKey: "admin",
  },
  {
    id: "about",
    name: "About Me",
    type: "internal",
    windowTitle: "Notes — About Me",
    defaultSize: { w: 720, h: 520 },
    desktop: true,
    icon: "/icons/notes.png",
    internalKey: "notes",
  },
  {
    id: "github",
    name: "GitHub",
    type: "external",
    windowTitle: "GitHub",
    defaultSize: { w: 720, h: 520 },
    dock: true,
    icon: "/icons/github.png",
    url: "https://github.com/e-dvni",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    type: "external",
    windowTitle: "LinkedIn",
    defaultSize: { w: 720, h: 520 },
    dock: true,
    icon: "/icons/linkedin.png",
    url: "https://www.linkedin.com/in/daniel-lee-7157a31a8/",
  },
  {
    id: "finder",
    name: "Finder",
    type: "internal",
    windowTitle: "Finder",
    defaultSize: { w: 760, h: 520 },
    dock: true,
    icon: "/icons/finder.png",
    internalKey: "finder",
  },
  {
    id: "terminal",
    name: "Terminal",
    type: "internal",
    windowTitle: "Terminal",
    defaultSize: { w: 760, h: 520 },
    dock: true,
    icon: "/icons/terminal.png",
    internalKey: "terminal",
  },
  {
    id: "mail",
    name: "Mail",
    type: "internal",
    windowTitle: "Mail",
    defaultSize: { w: 820, h: 560 },
    dock: true,
    icon: "/icons/mail.png",
    internalKey: "mail",
  },
];
