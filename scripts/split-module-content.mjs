/**
 * Helper: creates submodule markdown from section blocks.
 * Run once after manual content splits - documents structure.
 */
import fs from "fs";
import path from "path";

const frontmatter = (title, description) => `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"').slice(0, 160)}"
lastUpdated: May 15, 2026
---

# ${title}

`;

console.log("Content files are maintained in src/content/ per navigation.json");
