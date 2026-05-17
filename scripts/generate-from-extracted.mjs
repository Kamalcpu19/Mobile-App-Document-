/**
 * Generate navigation.json and markdown pages from scripts/extracted-content.txt
 * (produced by extract-docx.mjs from the Mobile Application Feature Documentation).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "src", "content");
const navPath = path.join(root, "src", "data", "navigation.json");
const extractPath = path.join(__dirname, "extracted-content.txt");

/** Page definitions in document order: regex matches section header line */
const PAGES = [
  // 1. Introduction
  { module: "introduction", slug: "overview", title: "Overview", pattern: /^1\.1\s+Overview/ },
  { module: "introduction", slug: "objectives", title: "Objectives", pattern: /^1\.2\s+Objectives/ },
  { module: "introduction", slug: "target-users", title: "Target Users", pattern: /^1\.3\s+Target Users/ },

  // 2. Login & Authentication
  { module: "authentication", slug: "feature-overview", title: "Feature Overview", pattern: /^2\.1\s+Feature Overview/ },
  { module: "authentication", slug: "available-features", title: "Available Features", pattern: /^2\.2\s+Available Features/ },
  { module: "authentication", slug: "login-flow", title: "Login Flow", pattern: /^2\.3\s+Login Flow/ },
  { module: "authentication", slug: "forgot-password-flow", title: "Forgot Password Flow", pattern: /^2\.4\s+Forgot Password Flow/ },
  { module: "authentication", slug: "create-account-flow", title: "Create Account Flow", pattern: /^2\.5\s+Create Account Flow/ },
  { module: "authentication", slug: "validations", title: "Validations", pattern: /^2\.6\s+Validations/ },
  { module: "authentication", slug: "expected-result", title: "Expected Result", pattern: /^2\.7\s+Expected Result/ },

  // 3. Dashboard
  { module: "dashboard", slug: "overview", title: "Overview", pattern: /^3\.1\s+Overview/ },
  { module: "dashboard", slug: "dashboard-sections", title: "Dashboard Sections", pattern: /^3\.2\s+Dashboard Sections/ },
  { module: "dashboard", slug: "customer-messages", title: "Customer Messages", pattern: /^3\.3\.1\s+Customer Messages/ },
  { module: "dashboard", slug: "appointments-scheduled", title: "Appointments Scheduled", pattern: /^3\.3\.2\s+Appointments Scheduled/ },
  { module: "dashboard", slug: "vehicles-requiring-attention", title: "Vehicles Requiring Attention", pattern: /^3\.3\.3\s+Vehicles Requiring Attention/ },
  { module: "dashboard", slug: "customer-payments-pending", title: "Customer Payments Pending", pattern: /^3\.3\.4\s+Customer Payments Pending/ },

  // 4. Create RO
  { module: "create-ro", slug: "overview", title: "Overview", pattern: /^4\.1\s+Overview/ },
  { module: "create-ro", slug: "create-ro-workflow", title: "Create RO Workflow", pattern: /^4\.2\s+Create RO Workflow/ },
  { module: "create-ro", slug: "vehicle-number-detection", title: "Vehicle Number Detection", pattern: /^4\.3\s+Vehicle Number Detection/ },
  { module: "create-ro", slug: "vehicle-image-capture", title: "Vehicle Image Capture", pattern: /^4\.4\s+Vehicle Image Capture/ },
  { module: "create-ro", slug: "pre-inspection-checklist", title: "Pre-Inspection Checklist", pattern: /^4\.5\s+Pre-Inspection Checklist/ },
  { module: "create-ro", slug: "vehicle-information", title: "Vehicle Information", pattern: /^4\.6\s+Vehicle Information/ },
  { module: "create-ro", slug: "customer-information", title: "Customer Information", pattern: /^4\.7\s+Customer Information/ },
  { module: "create-ro", slug: "complaints-voice-input", title: "Complaints & Voice Input", pattern: /^4\.8\s+Complaints/ },
  { module: "create-ro", slug: "service-history", title: "Service History", pattern: /^4\.9\s+Service History/ },
  { module: "create-ro", slug: "pre-inspection-completion", title: "Pre-Inspection Completion", pattern: /^4\.10\s+Pre-Inspection Completion/ },

  // 5. Customer Messages
  { module: "customer-messages", slug: "description", title: "Description", pattern: /^5\.1\s+Description/ },
  { module: "customer-messages", slug: "features", title: "Features", pattern: /^5\.2\s+Features/ },
  { module: "customer-messages", slug: "communication-workflow", title: "Communication Workflow", pattern: /^5\.3\s+Communication Workflow/ },
  { module: "customer-messages", slug: "ai-complaint-detection", title: "AI Complaint Detection", pattern: /^5\.4\s+AI Complaint Detection/ },

  // 6. Today's Appointments
  { module: "appointments", slug: "description", title: "Description", pattern: /^6\.1\s+Description/ },
  { module: "appointments", slug: "appointment-categories", title: "Appointment Categories", pattern: /^6\.2\s+Appointment Categories/ },
  { module: "appointments", slug: "features", title: "Features", pattern: /^6\.3\s+Features/ },
  { module: "appointments", slug: "workflow", title: "Workflow", pattern: /^6\.4\s+Workflow/ },
  { module: "appointments", slug: "expected-result", title: "Expected Result", pattern: /^6\.5\s+Expected Result/ },

  // 7. Vehicle Required Attention
  { module: "vehicle-attention", slug: "description", title: "Description", pattern: /^7\.1\s+Description/ },
  { module: "vehicle-attention", slug: "features", title: "Features", pattern: /^7\.2\s+Features/ },
  { module: "vehicle-attention", slug: "status-categories", title: "Status Categories", pattern: /^7\.3\s+Status Categories/ },
  { module: "vehicle-attention", slug: "workflow", title: "Workflow", pattern: /^7\.4\s+Workflow/ },
  { module: "vehicle-attention", slug: "expected-result", title: "Expected Result", pattern: /^7\.5\s+Expected Result/ },

  // 8. Customer Payments Pending
  { module: "payments", slug: "description", title: "Description", pattern: /^8\.1\s+Description/ },
  { module: "payments", slug: "features", title: "Features", pattern: /^8\.2\s+Features/ },
  { module: "payments", slug: "workflow", title: "Workflow", pattern: /^8\.3\s+Workflow/ },
  { module: "payments", slug: "expected-result", title: "Expected Result", pattern: /^8\.4\s+Expected Result/ },

  // 9. Common Navigation
  { module: "navigation", slug: "create-ro-access", title: "Create RO Access", pattern: /^9\.1\s+Create RO Access/ },
  { module: "navigation", slug: "profile-access-navigation", title: "Profile Access", pattern: /^9\.2\s+Profile Access/ },

  // 10. Profile Access
  { module: "profile-access", slug: "overview", title: "Overview", pattern: /^10\.1\s+Overview/ },
  { module: "profile-access", slug: "available-sections", title: "Available Sections", pattern: /^10\.2\s+Available Sections/ },
  { module: "profile-access", slug: "user-profile-information", title: "User Profile Information", pattern: /^10\.3\s+User Profile Information/ },
  { module: "profile-access", slug: "workshop-information", title: "Workshop Information", pattern: /^10\.4\s+Workshop Information/ },
  { module: "profile-access", slug: "contact-location-details", title: "Contact & Location Details", pattern: /^10\.5\s+Contact/ },
  { module: "profile-access", slug: "plan-subscription", title: "Plan & Subscription", pattern: /^10\.6\s+Plan/ },
  { module: "profile-access", slug: "enabled-capabilities", title: "Enabled Capabilities", pattern: /^10\.7\s+Enabled Capabilities/ },
  { module: "profile-access", slug: "package-features", title: "Package Features", pattern: /^10\.8\s+Package Features/ },
  { module: "profile-access", slug: "privacy-data-settings", title: "Privacy & Data Settings", pattern: /^10\.9\s+Privacy/ },
  { module: "profile-access", slug: "app-language-settings", title: "App Language Settings", pattern: /^10\.10\s+App Language/ },
  { module: "profile-access", slug: "workspace-settings", title: "Workspace Settings", pattern: /^10\.11\s+Workspace/ },
  { module: "profile-access", slug: "app-version-information", title: "App Version Information", pattern: /^10\.12\s+App Version/ },
  { module: "profile-access", slug: "sign-out", title: "Sign Out", pattern: /^10\.13\s+Sign Out/ },

  // 11–12
  { module: "navigation-flow", slug: "overall-navigation-flow", title: "Overall Application Navigation Flow", pattern: /^11\.\s+Overall Application Navigation Flow/ },
  { module: "navigation-flow", slug: "summary", title: "Summary", pattern: /^12\.\s+Summary/ },
];

const MODULE_META = {
  introduction: {
    id: "introduction",
    title: "Introduction",
    slug: "introduction",
    icon: "book-open",
    description: "Product overview, objectives, and target users",
    order: 1,
  },
  authentication: {
    id: "authentication",
    title: "Login & Authentication",
    slug: "authentication",
    icon: "log-in",
    description: "User sign in, account creation, password recovery, and validations",
    order: 2,
  },
  dashboard: {
    id: "dashboard",
    title: "Dashboard / Landing Page",
    slug: "dashboard",
    icon: "layout-dashboard",
    description: "Main dashboard with reminders, cards, and quick actions",
    order: 3,
  },
  "create-ro": {
    id: "create-ro",
    title: "Create RO (Repair Order)",
    slug: "create-ro",
    icon: "clipboard-list",
    description: "Repair order creation, inspection, and vehicle workflow",
    order: 4,
  },
  "customer-messages": {
    id: "customer-messages",
    title: "Customer Messages",
    slug: "customer-messages",
    icon: "message-square",
    description: "Customer communications and AI complaint detection",
    order: 5,
  },
  appointments: {
    id: "appointments",
    title: "Today's Appointments",
    slug: "appointments",
    icon: "calendar",
    description: "Daily appointment scheduling and filtering",
    order: 6,
  },
  "vehicle-attention": {
    id: "vehicle-attention",
    title: "Vehicle Required Attention",
    slug: "vehicle-attention",
    icon: "car",
    description: "In-service vehicles and workflow stages",
    order: 7,
  },
  payments: {
    id: "payments",
    title: "Customer Payments Pending",
    slug: "payments",
    icon: "credit-card",
    description: "Pending invoice payments and follow-ups",
    order: 8,
  },
  navigation: {
    id: "navigation",
    title: "Common Navigation Features",
    slug: "navigation",
    icon: "route",
    description: "Create RO and profile access from every module",
    order: 9,
  },
  "profile-access": {
    id: "profile-access",
    title: "Profile Access",
    slug: "profile-access",
    icon: "user",
    description: "User profile, workshop settings, language, and sign out",
    order: 10,
  },
  "navigation-flow": {
    id: "navigation-flow",
    title: "Navigation Flow & Summary",
    slug: "navigation-flow",
    icon: "git-branch",
    description: "End-to-end application flow and documentation summary",
    order: 11,
  },
};

const SECTION_LABELS = new Set([
  "Description",
  "Overview",
  "Objectives",
  "Target Users",
  "Available Features",
  "Available Options",
  "Available Sections",
  "Available Details",
  "Available Actions",
  "Available Information",
  "Available Capabilities",
  "Available Package Features",
  "Features",
  "Workflow",
  "Login Flow",
  "Forgot Password Flow",
  "Create Account Flow",
  "Communication Workflow",
  "Create RO Workflow",
  "Validations",
  "Expected Result",
  "Expected Results",
  "Dashboard Sections",
  "Dashboard Information Cards",
  "Required Images",
  "Auto Data Extraction",
  "Inspection Categories",
  "Inspection Items",
  "Inspection Features",
  "Swipe Actions",
  "Inspection Status Types",
  "Status Categories",
  "Appointment Categories",
  "Document Information",
  "Field",
  "Details",
]);

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/→/g, " → ")
    .replace(/'/g, "'");
}

function isPageHeader(line) {
  return PAGES.some((p) => p.pattern.test(line.trim()));
}

function findPage(line) {
  const trimmed = line.trim();
  for (const p of PAGES) {
    if (p.pattern.test(trimmed)) return p;
  }
  return null;
}

function isNestedSectionHeader(line) {
  return /^\d+\.\d+(?:\.\d+)+\s+/.test(line.trim());
}

function isTopModuleHeader(line) {
  return /^\d+\.\s+[A-Z]/.test(line.trim()) && !isPageHeader(line);
}

function isFlowSection(title) {
  return /flow$/i.test(title) || title === "Workflow";
}

function emitListItems(out, items, { numbered = false } = {}) {
  if (!items.length) return;
  out.push("");
  items.forEach((b, idx) => {
    if (b.endsWith(":") && items.length > 2) {
      out.push(`**${b}**`);
    } else if (numbered) {
      out.push(`${idx + 1}. ${b}`);
    } else {
      out.push(`- ${b}`);
    }
  });
}

function toMarkdown(bodyLines, pageTitle) {
  const lines = bodyLines.map((l) => decode(l.trim())).filter(Boolean);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isNestedSectionHeader(line)) {
      const subTitle = line.replace(/^\d+(?:\.\d+)+\s+/, "").trim();
      out.push(`### ${subTitle}`);
      i++;

      if (SECTION_LABELS.has(subTitle) || subTitle === "Inspection Items") {
        const bullets = [];
        const numbered = isFlowSection(subTitle);
        while (i < lines.length) {
          const next = lines[i];
          if (
            SECTION_LABELS.has(next) ||
            isNestedSectionHeader(next) ||
            isPageHeader(next) ||
            isTopModuleHeader(next)
          ) {
            break;
          }
          if (next.includes("→")) {
            const parts = next.split("→").map((s) => s.trim()).filter(Boolean);
            if (parts.length > 1) {
              out.push("");
              parts.forEach((p, idx) => out.push(`${idx + 1}. ${p}`));
              i++;
              break;
            }
          }
          if (/^[A-Z]\.\s/.test(next)) {
            out.push("");
            out.push(`#### ${next}`);
            i++;
            continue;
          }
          if (next === "Inspection Items") {
            out.push("");
            out.push("**Inspection Items**");
            i++;
            continue;
          }
          bullets.push(next);
          i++;
        }
        if (bullets.length) emitListItems(out, bullets, { numbered });
      }
      continue;
    }

    if (isTopModuleHeader(line) || isPageHeader(line)) {
      i++;
      continue;
    }

    if (SECTION_LABELS.has(line)) {
      out.push(`### ${line}`);
      i++;
      const bullets = [];
      const numbered = isFlowSection(line);
      while (i < lines.length) {
        const next = lines[i];
        if (
          SECTION_LABELS.has(next) ||
          isNestedSectionHeader(next) ||
          isPageHeader(next) ||
          isTopModuleHeader(next)
        ) {
          break;
        }
        if (next.includes("→") && bullets.length === 0) {
          const parts = next.split("→").map((s) => s.trim()).filter(Boolean);
          if (parts.length > 1) {
            out.push("");
            parts.forEach((p, idx) => out.push(`${idx + 1}. ${p}`));
            i++;
            break;
          }
        }
        if (/^[A-Z]\.\s/.test(next)) {
          out.push("");
          out.push(`#### ${next}`);
          i++;
          continue;
        }
        if (next === "Inspection Items") {
          out.push("");
          out.push("**Inspection Items**");
          i++;
          continue;
        }
        bullets.push(next);
        i++;
      }
      if (bullets.length) emitListItems(out, bullets, { numbered });
      continue;
    }

    if (line.includes("→") && line.length < 300) {
      const parts = line.split("→").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        out.push("");
        out.push("**Flow:**");
        out.push("");
        parts.forEach((p, idx) => out.push(`${idx + 1}. ${p}`));
        i++;
        continue;
      }
    }

    if (line === "Example:") {
      out.push("");
      out.push("**Example:**");
      i++;
      if (i < lines.length) {
        out.push("");
        out.push(`> ${lines[i]}`);
        i++;
      }
      continue;
    }

    if (line === "Mark's inspection item as:" || line === "Mark inspection item as:") {
      out.push("");
      out.push(`*${line}*`);
      i++;
      continue;
    }

    if (line.endsWith(":") && i + 1 < lines.length) {
      out.push(`**${line}**`);
      i++;
      const subBullets = [];
      while (i < lines.length) {
        const next = lines[i];
        if (
          SECTION_LABELS.has(next) ||
          isNestedSectionHeader(next) ||
          isPageHeader(next) ||
          isTopModuleHeader(next) ||
          next.endsWith(":")
        ) {
          break;
        }
        subBullets.push(next);
        i++;
      }
      if (subBullets.length) {
        out.push("");
        for (const b of subBullets) {
          out.push(`- ${b}`);
        }
      }
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join("\n\n").trim();
}

function formatFlowPageBody(title, bodyLines) {
  const lines = bodyLines.map((l) => decode(l.trim())).filter(Boolean);
  if (!lines.length) return "";

  const hasSection = lines.some(
    (l) => SECTION_LABELS.has(l) || isNestedSectionHeader(l)
  );
  if (hasSection) return toMarkdown(bodyLines, title);

  if (!isFlowSection(title)) return toMarkdown(bodyLines, title);

  const out = [`### ${title}`, ""];
  lines.forEach((line, idx) => {
    if (line.includes("→")) {
      const parts = line.split("→").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        out.push("**Flow:**", "");
        parts.forEach((p, i) => out.push(`${i + 1}. ${p}`));
        return;
      }
    }
    out.push(`${idx + 1}. ${line}`);
  });
  return out.join("\n\n");
}

function firstDescription(bodyLines) {
  const idx = bodyLines.findIndex((l) => l.trim() === "Description");
  if (idx >= 0 && bodyLines[idx + 1]) {
    return decode(bodyLines[idx + 1].trim()).slice(0, 160);
  }
  const para = bodyLines.find(
    (l) =>
      l.trim() &&
      !SECTION_LABELS.has(l.trim()) &&
      !isNestedSectionHeader(l) &&
      !isPageHeader(l)
  );
  return decode(para?.trim() ?? "").slice(0, 160);
}

function slugifyId(slug) {
  return slug;
}

function parseSections(raw) {
  const blocks = raw.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const startIdx = blocks.findIndex((b) => /^1\.1\s+Overview/.test(b.split("\n")[0].trim()));
  const slice = startIdx >= 0 ? blocks.slice(startIdx) : blocks;

  const sections = [];
  let current = null;

  for (const block of slice) {
    const lines = block.split("\n").map((l) => l.trim());
    const firstLine = lines[0];
    const page = findPage(firstLine);

    if (page) {
      if (current) sections.push(current);
      current = { ...page, bodyLines: lines.slice(1) };
    } else if (current) {
      current.bodyLines.push(...lines);
    }
  }
  if (current) sections.push(current);

  return sections;
}

function buildDocInfoTable() {
  return `| Field | Details |
| --- | --- |
| Product Name | Mobile Application |
| Version | v1.0 |
| Document Type | Functional Feature Documentation |
| Purpose | Product Feature Documentation for Development, QA Testing, UAT, and Release Readiness |`;
}

function writeContent(sections) {
  if (fs.existsSync(contentDir)) {
    for (const mod of fs.readdirSync(contentDir)) {
      const modPath = path.join(contentDir, mod);
      if (fs.statSync(modPath).isDirectory()) {
        for (const f of fs.readdirSync(modPath)) {
          fs.unlinkSync(path.join(modPath, f));
        }
        fs.rmdirSync(modPath);
      }
    }
  }

  const moduleSubmodules = new Map();

  for (const sec of sections) {
    const dir = path.join(contentDir, sec.module);
    fs.mkdirSync(dir, { recursive: true });

    let markdown = formatFlowPageBody(sec.title, sec.bodyLines);
    if (sec.module === "introduction" && sec.slug === "overview") {
      markdown = `**Document Information**\n\n${buildDocInfoTable()}\n\n${markdown}`;
    }

    const description = firstDescription(sec.bodyLines) || sec.title;
    const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    const frontmatter = `---
title: "${esc(sec.title)}"
description: "${esc(description)}"
lastUpdated: May 17, 2026
---

# ${sec.title}

${markdown}
`;

    fs.writeFileSync(path.join(dir, `${sec.slug}.md`), frontmatter, "utf-8");

    if (!moduleSubmodules.has(sec.module)) {
      moduleSubmodules.set(sec.module, []);
    }
    const subs = moduleSubmodules.get(sec.module);
    subs.push({
      id: slugifyId(sec.slug),
      title: sec.title,
      slug: sec.slug,
      description: decode(description).slice(0, 120),
      order: subs.length + 1,
    });
  }

  return moduleSubmodules;
}

function writeNavigation(moduleSubmodules) {
  const modules = [];

  for (const [moduleKey, meta] of Object.entries(MODULE_META)) {
    const subs = moduleSubmodules.get(moduleKey);
    if (!subs?.length) continue;
    modules.push({
      ...meta,
      submodules: subs,
    });
  }

  modules.sort((a, b) => a.order - b.order);

  const nav = {
    title: "Mobile Application Feature Documentation",
    description:
      "Product Feature Documentation for Development, QA Testing, UAT, and Release Readiness",
    version: "1.0",
    modules,
  };

  fs.writeFileSync(navPath, JSON.stringify(nav, null, 2) + "\n", "utf-8");
  return nav;
}

function main() {
  if (!fs.existsSync(extractPath)) {
    console.error(`Missing ${extractPath}. Run: node scripts/extract-docx.mjs "<path-to.docx>"`);
    process.exit(1);
  }

  const raw = fs.readFileSync(extractPath, "utf-8");
  const sections = parseSections(raw);
  console.log(`Parsed ${sections.length} documentation pages.`);

  const moduleSubmodules = writeContent(sections);
  const nav = writeNavigation(moduleSubmodules);

  console.log(`Wrote ${sections.length} markdown files.`);
  console.log(`Navigation: ${nav.modules.length} modules, ${sections.length} pages.`);
}

main();
