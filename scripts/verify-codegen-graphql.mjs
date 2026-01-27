import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const graphqlDir = path.join(projectRoot, "src", "graphql");

const expected = new Set([
  "mutations.ts",
  "queries.ts",
  "subscriptions.ts",
]);

// Optional documentation file; safe if present.
const allowedExtras = new Set([
    "README.md",
    "schema.json"
]);

function fail(message) {
  console.error(`\n[verify:codegen-graphql] ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(graphqlDir)) {
  fail(`Missing directory: ${path.relative(projectRoot, graphqlDir)} (run Amplify codegen or restore generated files).`);
}

const entries = fs.readdirSync(graphqlDir, { withFileTypes: true });
const files = entries.filter((e) => e.isFile()).map((e) => e.name);
const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

if (dirs.length > 0) {
  fail(`Unexpected subdirectories in src/graphql: ${dirs.join(", ")}`);
}

for (const f of expected) {
  if (!files.includes(f)) {
    fail(`Missing expected codegen output: src/graphql/${f}`);
  }
}

const unexpected = files.filter((f) => !expected.has(f) && !allowedExtras.has(f));
const unexpectedNonDts = unexpected.filter((f) => !f.endsWith(".d.ts"));
if (unexpectedNonDts.length > 0) {
  fail(
    `Unexpected files in src/graphql (do not hand-edit this folder): ${unexpectedNonDts.join(", ")}. ` +
      `Put custom operations in src/api/operationsMinimal.ts instead.`
  );
}

console.log("[verify:codegen-graphql] OK");
