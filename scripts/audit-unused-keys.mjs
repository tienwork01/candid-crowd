import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

function flatten(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

async function getSourceFiles(directory) {
  const dirents = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const fullPath = join(directory, dirent.name);

      return dirent.isDirectory() ? getSourceFiles(fullPath) : fullPath;
    }),
  );

  return files
    .flat()
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
}

const en = JSON.parse(
  await readFile(join(process.cwd(), "messages/en.json"), "utf8"),
);
const allKeys = flatten(en);

const srcFiles = await getSourceFiles(join(process.cwd(), "src"));
const sourceContents = await Promise.all(
  srcFiles.map((file) => readFile(file, "utf8")),
);
const combinedSource = sourceContents.join("\n");

// Keys that are accessed dynamically at runtime or by framework configuration
const dynamicNamespacePrefixes = [
  "formats.", // Next-intl formatting configurations
  "marketing.photos.", // photo.id dynamic lookup
  "marketing.eventTypesSection.items.", // item.key dynamic lookup
  "marketing.participation.funnel.", // step.key dynamic lookup
  "common.errors.", // Error code dynamic lookup in src/lib/errors.ts
  "event.types.", // Dynamic event type label lookup
];

const unusedKeys = [];

for (const key of allKeys) {
  if (dynamicNamespacePrefixes.some((prefix) => key.startsWith(prefix))) {
    continue;
  }

  const keyParts = key.split(".");
  const leafKey = keyParts[keyParts.length - 1];

  // A key is used if its exact leaf or full path is present in the source files
  if (!combinedSource.includes(leafKey) && !combinedSource.includes(key)) {
    unusedKeys.push(key);
  }
}

if (unusedKeys.length > 0) {
  console.error(
    `\n❌ Found ${unusedKeys.length} unused / orphaned translation key(s) in messages/en.json:`,
  );

  for (const key of unusedKeys) {
    console.error(`   - ${key}`);
  }

  console.error(
    "\nRule in AGENTS.md: When modifying code and an i18n key is no longer used anywhere, that key MUST be removed from all messages/*.json files.\n",
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ i18n dead-key audit passed: All ${allKeys.length} keys are actively referenced in codebase.\n`,
  );
}
