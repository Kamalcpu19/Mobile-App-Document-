/**
 * Clears Next.js build caches (fixes EPERM / Internal Server Error on Windows + OneDrive).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const cacheDirs = [
  ".next",
  path.join("node_modules", ".cache", "next"),
  path.join("node_modules", ".cache", "webpack"),
];

for (const rel of cacheDirs) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) continue;
  try {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    console.log(`Removed ${rel}`);
  } catch (err) {
    console.warn(`Could not remove ${rel}: ${err.message}`);
    console.warn("Stop all 'npm run dev' terminals, then run: npm run clean");
  }
}

console.log("Cache cleanup finished.");
