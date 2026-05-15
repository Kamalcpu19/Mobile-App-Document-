import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "src", "content");
const extractPath = path.join(__dirname, "extracted-content.txt");

const SECTION_MAP = [
  { pattern: /^1\. Overview$/, module: "getting-started", slug: "overview", title: "Overview" },
  { pattern: /^2\. Login/, module: "authentication", slug: "login-authentication", title: "Login & Authentication" },
  { pattern: /^3\. Landing Page/, module: "dashboard", slug: "landing-page-dashboard", title: "Landing Page / Dashboard" },
  { pattern: /^4\.1 Vehicle Number/, module: "create-ro", slug: "vehicle-number-detection", title: "Vehicle Number Detection" },
  { pattern: /^4\.2 Vehicle Image/, module: "create-ro", slug: "vehicle-image-capture", title: "Vehicle Image Capture" },
  { pattern: /^4\.3\.1 Pre and Post/, module: "create-ro", slug: "pre-and-post-checks", title: "Pre and Post Checks" },
  { pattern: /^4\.3\.2 Car Check In$/, module: "create-ro", slug: "car-check-in", title: "Car Check In" },
  { pattern: /^4\.3\.3 Check In Category$/, module: "create-ro", slug: "check-in-category", title: "Check In Category" },
  { pattern: /^4\.3 Pre-Inspection/, module: "create-ro", slug: "pre-inspection-checklist", title: "Pre-Inspection Checklist" },
  { pattern: /^4\.4 Vehicle Information$/, module: "create-ro", slug: "vehicle-information", title: "Vehicle Information" },
  { pattern: /^4\.5 Customer Information$/, module: "create-ro", slug: "customer-information", title: "Customer Information" },
  { pattern: /^4\.6 Complaints/, module: "create-ro", slug: "complaints-voice-input", title: "Complaints & Voice Input" },
  { pattern: /^4\.7 Service History$/, module: "create-ro", slug: "service-history", title: "Service History" },
  { pattern: /^4\.8 Pre-Inspection Completion$/, module: "create-ro", slug: "pre-inspection-completion", title: "Pre-Inspection Completion" },
  { pattern: /^4\. Create RO/, module: "create-ro", slug: "create-ro-overview", title: "Create RO (Repair Order)" },
  { pattern: /^5\. Customer Messages/, module: "customer-messages", slug: "customer-messages", title: "Customer Messages Module" },
  { pattern: /^6\. Today/, module: "appointments", slug: "todays-appointments", title: "Today's Appointments Module" },
  { pattern: /^7\. Vehicle Required/, module: "vehicle-attention", slug: "vehicle-required-attention", title: "Vehicle Required Attention Module" },
  { pattern: /^8\. Customer Payments/, module: "payments", slug: "customer-payments-pending", title: "Customer Payments Pending Module" },
  { pattern: /^9\. Common Navigation/, module: "navigation", slug: "common-navigation", title: "Common Navigation Features" },
  { pattern: /^9\.1 User Profile/, module: "profile-access", slug: "user-profile-information", title: "User Profile Information" },
  { pattern: /^9\.2 Workshop Information$/, module: "profile-access", slug: "workshop-information", title: "Workshop Information" },
  { pattern: /^9\.3 Contact/, module: "profile-access", slug: "contact-location-details", title: "Contact & Location Details" },
  { pattern: /^9\.4 Plan/, module: "profile-access", slug: "plan-subscription", title: "Plan & Subscription" },
  { pattern: /^9\.5 Enabled/, module: "profile-access", slug: "enabled-capabilities", title: "Enabled Capabilities" },
  { pattern: /^9\.6 Package Features$/, module: "profile-access", slug: "package-features", title: "Package Features" },
  { pattern: /^9\.7 Privacy/, module: "profile-access", slug: "privacy-data-settings", title: "Privacy & Data Settings" },
  { pattern: /^9\.8 App Language/, module: "profile-access", slug: "app-language-settings", title: "App Language Settings" },
  { pattern: /^9\.9 Workspace/, module: "profile-access", slug: "workspace-settings", title: "Workspace Settings" },
  { pattern: /^9\.10 App Version/, module: "profile-access", slug: "app-version-information", title: "App Version Information" },
  { pattern: /^9\.11 Sign Out$/, module: "profile-access", slug: "sign-out", title: "Sign Out" },
  { pattern: /^9\. Profile Access/, module: "profile-access", slug: "profile-access-overview", title: "Profile Access Module" },
  { pattern: /^10\. Overall Application/, module: "navigation", slug: "application-navigation-flow", title: "Overall Application Navigation Flow" },
];

function decode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/→/g, " → ");
}

function isSectionHeader(line) {
  return SECTION_MAP.some((s) => s.pattern.test(line.trim()));
}

function findSection(line) {
  const trimmed = line.trim();
  for (const s of SECTION_MAP) {
    if (s.pattern.test(trimmed)) return s;
  }
  return null;
}

function toMarkdown(bodyLines) {
  const lines = bodyLines.map((l) => decode(l.trim())).filter(Boolean);
  const out = [];
  let i = 0;

  const sectionLabels = new Set([
    "Description",
    "Available Options",
    "Available Sections",
    "Available Details",
    "Available Features",
    "Available Actions",
    "Available Information",
    "Available Capabilities",
    "Available Package Features",
    "Login Flow",
    "Forgot Password Flow",
    "Create Account Flow",
    "Create RO Flow",
    "Flow",
    "Communication Flow",
    "Validations",
    "Expected Result",
    "Dashboard Information Cards",
    "Inspection Categories",
    "Inspection Items",
    "Inspection Features",
    "Swipe Actions",
    "Inspection Status Types",
    "Status Categories",
    "Appointment Categories",
    "Required Images",
    "Auto Data Extraction",
    "Target Users",
    "Objective",
    "Product Name",
  ]);

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("Feature:")) {
      out.push(`## ${line}`);
      i++;
      continue;
    }

    if (sectionLabels.has(line)) {
      out.push(`### ${line}`);
      i++;
      const bullets = [];
      while (i < lines.length) {
        const next = lines[i];
        if (
          sectionLabels.has(next) ||
          next.startsWith("Feature:") ||
          isSectionHeader(next) ||
          /^\d+\./.test(next)
        ) {
          break;
        }
        if (next.includes("→") && bullets.length === 0) {
          out.push("");
          out.push(next.split("→").map((s) => s.trim()).filter(Boolean).map((s, idx) => `${idx + 1}. ${s}`).join("\n"));
          i++;
          break;
        }
        bullets.push(next);
        i++;
      }
      if (bullets.length) {
        out.push("");
        for (const b of bullets) {
          if (b.endsWith(":") && bullets.length > 3) {
            out.push(`**${b}**`);
          } else {
            out.push(`- ${b}`);
          }
        }
      }
      continue;
    }

    if (line.includes("→") && line.length < 200) {
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
      if (i < lines.length) out.push(`\n> ${lines[i]}`);
      i++;
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join("\n\n");
}

function main() {
  const raw = fs.readFileSync(extractPath, "utf-8");
  const blocks = raw.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  // Skip document header (before "1. Overview")
  let startIdx = blocks.findIndex((b) => /^1\. Overview$/.test(b.trim()));
  if (startIdx < 0) startIdx = 0;

  const sections = [];
  let current = null;

  for (let i = startIdx; i < blocks.length; i++) {
    const block = blocks[i];
    const firstLine = block.split("\n")[0].trim();
    const section = findSection(firstLine);

    if (section) {
      if (current) sections.push(current);
      const bodyLines = block.split("\n").slice(1);
      current = { ...section, bodyLines };
    } else if (current) {
      current.bodyLines.push(...block.split("\n"));
    }
  }
  if (current) sections.push(current);

  // Remove old content dirs except we'll overwrite
  if (fs.existsSync(contentDir)) {
    for (const mod of fs.readdirSync(contentDir)) {
      const modPath = path.join(contentDir, mod);
      if (fs.statSync(modPath).isDirectory()) {
        for (const f of fs.readdirSync(modPath)) {
          fs.unlinkSync(path.join(modPath, f));
        }
      }
    }
  }

  const moduleMeta = new Map();

  for (const sec of sections) {
    const dir = path.join(contentDir, sec.module);
    fs.mkdirSync(dir, { recursive: true });

    const markdown = toMarkdown(sec.bodyLines);
    const descLine = sec.bodyLines.find(
      (l) => l.trim() && !["Description", "Feature:"].some((x) => l.startsWith(x))
    );
    let description = decode(descLine?.trim() ?? sec.title);
    if (description.startsWith("Feature:")) {
      const afterDesc = sec.bodyLines.findIndex((l) => l.trim() === "Description");
      if (afterDesc >= 0 && sec.bodyLines[afterDesc + 1]) {
        description = decode(sec.bodyLines[afterDesc + 1].trim());
      }
    }
    description = description.slice(0, 160).replace(/"/g, '\\"');

    const frontmatter = `---
title: "${sec.title.replace(/"/g, '\\"')}"
description: "${description}"
lastUpdated: May 15, 2026
---

# ${sec.title}

${markdown}
`;

    fs.writeFileSync(path.join(dir, `${sec.slug}.md`), frontmatter, "utf-8");

    if (!moduleMeta.has(sec.module)) {
      moduleMeta.set(sec.module, { submodules: [] });
    }
    moduleMeta.get(sec.module).submodules.push({
      id: sec.slug,
      title: sec.title,
      slug: sec.slug,
      description: decode(description).slice(0, 120),
    });
  }

  console.log(`Generated ${sections.length} documentation pages.`);
  return moduleMeta;
}

main();
