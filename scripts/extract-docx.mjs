import fs from "fs";
import path from "path";

const docxPath = process.argv[2] || "c:\\Users\\kamal\\OneDrive\\Desktop\\mobile.docx";
const outPath = process.argv[3] || path.join(process.cwd(), "scripts", "extracted-content.txt");

// Read document.xml from extracted zip or extract on the fly
const extractDir = path.join(process.cwd(), "scripts", ".docx-temp");
const zipCopy = path.join(extractDir, "doc.zip");
const xmlPath = path.join(extractDir, "word", "document.xml");

if (!fs.existsSync(xmlPath)) {
  fs.mkdirSync(extractDir, { recursive: true });
  fs.copyFileSync(docxPath, zipCopy);
  // Use PowerShell to expand
  const { execSync } = await import("child_process");
  execSync(
    `powershell -Command "Expand-Archive -Path '${zipCopy.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit" }
  );
}

const xml = fs.readFileSync(xmlPath, "utf-8");

// Extract paragraphs: w:t text nodes, detect headings via w:pStyle
const paragraphs = [];
const pRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
let pMatch;

while ((pMatch = pRegex.exec(xml)) !== null) {
  const pContent = pMatch[1];
  const styleMatch = pContent.match(/<w:pStyle w:val="([^"]+)"/);
  const style = styleMatch?.[1] ?? "";

  const texts = [];
  const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let tMatch;
  while ((tMatch = tRegex.exec(pContent)) !== null) {
    texts.push(tMatch[1]);
  }
  const text = texts.join("").trim();
  if (text) {
    paragraphs.push({ style, text });
  }
}

// Output structured text
const lines = paragraphs.map((p) => {
  const isHeading =
    /^Heading/i.test(p.style) ||
    /^Title/i.test(p.style) ||
    /^TOCHeading/i.test(p.style);
  const level = p.style.match(/(\d+)/)?.[1];
  if (isHeading) {
    const hashes = level ? "#".repeat(Math.min(parseInt(level, 10), 4)) : "##";
    return `${hashes} ${p.text}`;
  }
  return p.text;
});

fs.writeFileSync(outPath, lines.join("\n\n"), "utf-8");
console.log(`Extracted ${paragraphs.length} paragraphs to ${outPath}`);

// Also output JSON for analysis
const jsonPath = outPath.replace(".txt", ".json");
fs.writeFileSync(jsonPath, JSON.stringify(paragraphs, null, 2), "utf-8");
console.log(`JSON saved to ${jsonPath}`);
