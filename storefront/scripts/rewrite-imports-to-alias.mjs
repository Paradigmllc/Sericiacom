// One-off codemod: rewrite `from "../../components/X"` → `from "@/components/X"`
// for all storefront top-level dirs. Run from `storefront/` after moving files
// between route groups. Idempotent: rerunning produces no further changes.
//
// Usage: node scripts/rewrite-imports-to-alias.mjs [target-dir]
// Default target dir: app/(frontend)
import fs from "node:fs";
import path from "node:path";

const ROOT_NAMES = [
  "components", "lib", "i18n", "hooks", "messages", "types", "utils",
  "store", "stores", "locales", "fonts", "public",
  "payload.config", "payload-types",
];
const escaped = ROOT_NAMES.map((n) => n.replace(/\./g, "\\.")).join("|");
// Match: quote, one-or-more "../", a top-level name, then either "/" (deeper path) or closing quote.
const RE = new RegExp(
  `(['"\`])(?:\\.\\./)+(${escaped})(/|['"\`])`,
  "g",
);

const target = process.argv[2] || "app/(frontend)";
let totalFiles = 0;
let totalReplacements = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (/\.(ts|tsx|mts|cts)$/.test(entry.name)) {
      const original = fs.readFileSync(p, "utf8");
      let count = 0;
      const out = original.replace(RE, (_, quote, name, tail) => {
        count += 1;
        return `${quote}@/${name}${tail}`;
      });
      if (count > 0) {
        fs.writeFileSync(p, out);
        totalFiles += 1;
        totalReplacements += count;
        console.log(`  ${path.relative(".", p)}: ${count}`);
      }
    }
  }
}

walk(target);
console.log(`\nTOTAL: ${totalReplacements} replacements in ${totalFiles} files`);
