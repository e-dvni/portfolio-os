# frozen_string_literal: true

# Seeds should be SAFE to run multiple times.
# This file is designed to be idempotent (no duplicate rows, no destroy_all).

puts "Seeding Portfolio OS…"

# ---------- Helpers ----------

def upsert_app!(attrs)
  slug = attrs.fetch(:slug)
  app = App.find_or_initialize_by(slug: slug)
  app.assign_attributes(attrs)
  app.save!
  app
end

def upsert_note!(attrs)
  slug = attrs.fetch(:slug)
  note = Note.find_or_initialize_by(slug: slug)
  note.assign_attributes(attrs)
  note.save!
  note
end

def upsert_project!(attrs)
  title = attrs.fetch(:title)
  project = Project.find_or_initialize_by(title: title)
  project.assign_attributes(attrs)
  project.save!
  project
end

# ---------- Apps ----------

apps = [
  {
    name: "Resume.pdf",
    slug: "resume",
    icon: "/icons/resume.png",
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
    icon: "/icons/ledJungle.png",
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
    icon: "/icons/signAvenue.png",
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
    icon: "/icons/aboutMe.png",
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
  {
    name: "Admin CMS",
    slug: "admin-cms",
    icon: "/icons/cms.png",
    app_type: "internal",
    window_title: "Admin CMS",
    default_w: 860,
    default_h: 600,
    desktop: false,
    dock: true,
    order_index: 20,
    launch_url: nil,
    internal_key: "admin-cms"
  }
]

apps.each { |attrs| upsert_app!(attrs) }
puts "✅ Apps seeded: #{App.count}"

# ---------- Notes ----------

upsert_note!(
  slug: "about",
  title: "About Me",
  body: <<~TEXT
    Junior software developer with hands-on experience building production-level React applications and custom web tools.
    Strong frontend foundation with growing full-stack skills, including API integration, authentication, and admin dashboards.
    Currently expanding CS fundamentals through Harvard’s CS50.

    Building this portfolio as a Mac-style OS to stand out while staying fast and professional.
  TEXT
)

upsert_note!(
  slug: "edu-cs50",
  title: "Harvard CS50",
  body: <<~TEXT
    Currently enrolled in Harvard’s CS50 to strengthen my computer science foundations.

    Focus areas:
    • Problem solving and algorithms
    • C and memory fundamentals
    • Python basics
    • Web programming concepts

    Goal: build stronger fundamentals while continuing to ship real products.
  TEXT
)

upsert_note!(
  slug: "edu-learn-academy",
  title: "LEARN Academy (Frontend)",
  body: <<~TEXT
    Frontend-focused learning and practice, building real UI features and small apps.

    Skills:
    • JavaScript fundamentals
    • React (components, state, hooks)
    • HTML/CSS + modern UI patterns
    • Tailwind styling workflows

    Goal: become fast and reliable building user-facing products.
  TEXT
)

upsert_note!(
  slug: "edu-kean",
  title: "Kean University — Accounting",
  body: <<~TEXT
    B.S. Accounting

    Strengths I bring from accounting:
    • Attention to detail and accuracy
    • Working with constraints and deadlines
    • Clear communication and documentation
    • Comfort with systems, numbers, and optimization
  TEXT
)

puts "✅ Notes seeded: #{Note.count}"

# ---------- Projects ----------

upsert_project!(
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

upsert_project!(
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

puts "✅ Projects seeded: #{Project.count}"

# ---------- Admin User ----------

admin_email = ENV["ADMIN_EMAIL"].to_s.strip.downcase
admin_password = ENV["ADMIN_PASSWORD"].to_s

if admin_email.present? && admin_password.present?
  admin = AdminUser.find_or_initialize_by(email: admin_email)

  # Only set password when creating the user or missing digest
  if admin.new_record? || admin.password_digest.blank?
    admin.password = admin_password
  end

  admin.save!
  puts "✅ Admin user ensured: #{admin.email}"
else
  puts "⚠️ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seed."
end
