App.destroy_all
Note.destroy_all
Project.destroy_all

apps = [
  {
    name: "Resume.pdf",
    slug: "resume",
    icon: "/icons/pdf.png",
    app_type: "pdf",
    window_title: "Resume.pdf",
    default_w: 900,
    default_h: 650,
    desktop: true,
    dock: false,
    order_index: 1,
    launch_url: "/docs/Resume.pdf",
    internal_key: nil
  },
  {
    name: "Custom LED Builder",
    slug: "led-builder",
    icon: "/icons/led.png",
    app_type: "iframe",
    window_title: "Custom LED Builder — LED Jungle",
    default_w: 1100,
    default_h: 720,
    desktop: true,
    dock: false,
    order_index: 2,
    launch_url: "https://led-jungle.com/pages/custom-text-led",
    internal_key: nil
  },
  {
    name: "Admin Dashboard",
    slug: "admin",
    icon: "/icons/dashboard.png",
    app_type: "internal",
    window_title: "Admin Dashboard — Sign Avenue",
    default_w: 1100,
    default_h: 720,
    desktop: true,
    dock: false,
    order_index: 3,
    launch_url: nil,
    internal_key: "admin"
  },
  {
    name: "About Me",
    slug: "about",
    icon: "/icons/notes.png",
    app_type: "internal",
    window_title: "Notes — About Me",
    default_w: 720,
    default_h: 520,
    desktop: true,
    dock: false,
    order_index: 4,
    launch_url: nil,
    internal_key: "notes"
  },
  {
    name: "Finder",
    slug: "finder",
    icon: "/icons/finder.png",
    app_type: "internal",
    window_title: "Finder",
    default_w: 760,
    default_h: 520,
    desktop: false,
    dock: true,
    order_index: 10,
    launch_url: nil,
    internal_key: "finder"
  },
  {
    name: "Terminal",
    slug: "terminal",
    icon: "/icons/terminal.png",
    app_type: "internal",
    window_title: "Terminal",
    default_w: 760,
    default_h: 520,
    desktop: false,
    dock: true,
    order_index: 11,
    launch_url: nil,
    internal_key: "terminal"
  },
  {
    name: "Mail",
    slug: "mail",
    icon: "/icons/mail.png",
    app_type: "internal",
    window_title: "Mail",
    default_w: 820,
    default_h: 560,
    desktop: false,
    dock: true,
    order_index: 12,
    launch_url: nil,
    internal_key: "mail"
  },
  {
    name: "GitHub",
    slug: "github",
    icon: "/icons/github.png",
    app_type: "external",
    window_title: "GitHub",
    default_w: 720,
    default_h: 520,
    desktop: false,
    dock: true,
    order_index: 13,
    launch_url: "https://github.com/e-dvni",
    internal_key: nil
  },
  {
    name: "LinkedIn",
    slug: "linkedin",
    icon: "/icons/linkedin.png",
    app_type: "external",
    window_title: "LinkedIn",
    default_w: 720,
    default_h: 520,
    desktop: false,
    dock: true,
    order_index: 14,
    launch_url: "https://www.linkedin.com/in/daniel-lee-7157a31a8/",
    internal_key: nil
  },
]

apps.each { |a| App.create!(a) }

Note.create!(
  slug: "about",
  title: "About Me",
  body: <<~TEXT
    Junior software developer with hands-on experience building production-level React applications and custom web tools.
    Strong frontend foundation with growing full-stack skills, including API integration, authentication, and admin dashboards.
    Currently expanding CS fundamentals through Harvard’s CS50.

    Building this portfolio as a Mac-style OS to stand out while staying fast and professional.
  TEXT
)

Project.create!(
  title: "Custom LED Builder (LED Jungle)",
  subtitle: "Dynamic pricing + live preview builder",
  tech_stack: "Shopify • Liquid • JavaScript",
  summary: "A production customization tool with character counting, custom line spacing, font/color selection, and size-based pricing logic.",
  repo_url: nil,
  live_url: "https://led-jungle.com/pages/custom-text-led",
  highlights: ["Live preview", "Font groups", "Price updates by size + characters"],
  media: [],
  order_index: 1
)

Project.create!(
  title: "Sign Avenue Admin Dashboard",
  subtitle: "Project tracking + scheduling + CRM workflows",
  tech_stack: "Vite React • Rails • Postgres",
  summary: "An internal dashboard with auth, project status tracking, installation scheduling, and contact request management.",
  repo_url: "https://github.com/e-dvni/signAvenue",
  live_url: nil,
  highlights: ["Auth login", "Project tracker", "Install scheduler", "Contact inbox"],
  media: [],
  order_index: 2
)
