import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const expectedLocales = ["en", "vi", "es", "fr", "de", "it", "pt-BR"];
const messagesDirectory = join(process.cwd(), "messages");

function flatten(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return [prefix];

  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

const files = await readdir(messagesDirectory);
const actualLocales = files
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -5));
const unsupported = actualLocales.filter(
  (locale) => !expectedLocales.includes(locale),
);
const missingFiles = expectedLocales.filter(
  (locale) => !actualLocales.includes(locale),
);

if (unsupported.length || missingFiles.length) {
  throw new Error(
    `Locale files mismatch. Missing: ${missingFiles.join(", ") || "none"}; unsupported: ${unsupported.join(", ") || "none"}`,
  );
}

const dictionaries = await Promise.all(
  expectedLocales.map(async (locale) => {
    try {
      return [
        locale,
        JSON.parse(
          await readFile(join(messagesDirectory, `${locale}.json`), "utf8"),
        ),
      ];
    } catch (error) {
      throw new Error(
        `Invalid JSON for ${locale}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }),
);
const englishKeys = new Set(flatten(Object.fromEntries(dictionaries).en));

for (const [locale, dictionary] of dictionaries) {
  const keys = new Set(flatten(dictionary));
  const missing = [...englishKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !englishKeys.has(key));

  if (missing.length || extra.length) {
    throw new Error(
      `${locale} keys differ from en. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`,
    );
  }
}

console.log(
  `Validated ${expectedLocales.length} locale files against en.json.`,
);
