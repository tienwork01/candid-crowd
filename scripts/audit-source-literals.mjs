import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import ts from "typescript";

const SRC_DIR = join(process.cwd(), "src");

// Files intentionally containing English legal contract prose
const LEGAL_FILES = new Set([
  "src/app/(marketing)/privacy/page.tsx",
  "src/app/(marketing)/terms/page.tsx",
]);

// Exact allowed strings (symbols, brands, demo mock entities, technical tokens)
const ALLOWED_EXACT = new Set([
  "CandidCrowd",
  "candidcrowd",
  "candidcrowd.",
  "Clerk",
  "Cloudflare",
  "Google",
  "Apple",
  "Emma & James",
  "May 24, 2026",
  "24/05/2026",
  "IMG_4821.jpg",
  "DSC_0042.jpg",
  "PXL_9012.jpg",
  "MVI_1082.mp4",
  "table-04",
  "entrance",
  "bar",
  "dj_booth",
  "reception",
  "wedding",
  "Hanoi, Vietnam",
  "Socialist Republic of Vietnam",
  "•",
  "©",
  "—",
  "–",
  "&rarr;",
  "&ldquo;",
  "&rdquo;",
  "&apos;",
  "USD 100",
  "/",
  "|",
  "+",
  "-",
  ":",
  "→",
]);

// Regex patterns for allowed text
const ALLOWED_PATTERNS = [
  // Pure numbers, whitespace, punctuation, math, or currency symbols
  /^[\d\s.,!?:;/\-_()•©—–&|*#+=\[\]{}'"`$€£¥%\\<>]+$/,
  // Template interpolation artifact or whitespace
  /^\s*$/,
  // URLs or emails
  /^(https?:\/\/|mailto:|\/)/,
  // MIME types
  /^(image|video|audio)\/[\w+.-]+$/,
];

function isAllowed(text, relPath) {
  const trimmed = text.trim();

  if (!trimmed) return true;

  // Legal agreement contract clauses in legal pages are retained in English
  if (LEGAL_FILES.has(relPath)) {
    return true;
  }

  // Exact match
  if (ALLOWED_EXACT.has(trimmed)) {
    return true;
  }

  // Pattern match
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (entry.isFile() && fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

const allFiles = await getFiles(SRC_DIR);
const violations = [];

for (const filePath of allFiles) {
  const relPath = relative(process.cwd(), filePath).replace(/\\/g, "/");
  const content = await readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  function visit(node) {
    // Check JSX Text
    if (ts.isJsxText(node)) {
      const text = node.text.trim();

      if (text && !isAllowed(text, relPath)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(),
        );

        violations.push({
          file: relPath,
          line: line + 1,
          text,
        });
      }
    }

    // Check relevant JSX string attributes (e.g. placeholder, aria-label, alt, title)
    if (ts.isJsxAttribute(node) && node.name && node.initializer) {
      const attrName = node.name.getText(sourceFile);
      const monitoredAttrs = ["placeholder", "aria-label", "alt", "title"];

      if (
        monitoredAttrs.includes(attrName) &&
        ts.isStringLiteral(node.initializer)
      ) {
        const text = node.initializer.text.trim();

        if (text && !isAllowed(text, relPath)) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.initializer.getStart(),
          );

          violations.push({
            file: relPath,
            line: line + 1,
            text: `[${attrName}] "${text}"`,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

if (violations.length > 0) {
  console.error(
    `Found ${violations.length} unlocalized source literal(s) in .tsx files:\n`,
  );

  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} -> ${v.text}`);
  }

  process.exit(1);
} else {
  console.log(
    `Source literal audit passed: scanned ${allFiles.length} TSX files, found 0 unlocalized literals.`,
  );
}
