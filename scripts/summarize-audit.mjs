import fs from "node:fs";

function readJson(path) {
  const raw = fs.readFileSync(path, "utf8");
  // PowerShell Out-File can emit a UTF-8 BOM; JSON.parse doesn't accept it.
  const cleaned = raw.replace(/^\uFEFF/, "");
  return JSON.parse(cleaned);
}

function extractVulns(report) {
  // npm audit v2 JSON
  const vulns = report?.vulnerabilities;
  if (!vulns || typeof vulns !== "object") return [];

  const out = [];
  for (const [name, info] of Object.entries(vulns)) {
    const severity = String(info?.severity ?? "unknown");
    const range = typeof info?.range === "string" ? info.range : "";
    const fixAvailable = info?.fixAvailable;
    const isFixBool = typeof fixAvailable === "boolean";
    const fix =
      isFixBool ? (fixAvailable ? "yes" : "no") : typeof fixAvailable === "object" && fixAvailable
        ? JSON.stringify(fixAvailable)
        : "unknown";

    // via can contain strings or objects
    const via = Array.isArray(info?.via) ? info.via : [];
    const viaNames = via
      .map((v) => (typeof v === "string" ? v : typeof v?.name === "string" ? v.name : null))
      .filter(Boolean);

    out.push({
      name,
      severity,
      range,
      fix,
      via: Array.from(new Set(viaNames)).slice(0, 8),
      effectsCount: Array.isArray(info?.effects) ? info.effects.length : 0,
      nodesCount: Array.isArray(info?.nodes) ? info.nodes.length : 0,
      isDirect: Boolean(info?.isDirect),
    });
  }
  return out;
}

function countsBySeverity(items) {
  const counts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0, unknown: 0 };
  for (const it of items) {
    const key = it.severity in counts ? it.severity : "unknown";
    counts[key] += 1;
  }
  return counts;
}

function printSummary(label, items) {
  const counts = countsBySeverity(items);
  console.log(`\n== ${label} ==`);
  console.log(`total: ${items.length}`);
  console.log(`severity: ${JSON.stringify(counts)}`);

  const top = items
    .slice()
    .sort((a, b) => {
      const sevRank = { critical: 5, high: 4, moderate: 3, low: 2, info: 1, unknown: 0 };
      return (sevRank[b.severity] ?? 0) - (sevRank[a.severity] ?? 0) || a.name.localeCompare(b.name);
    })
    .slice(0, 15);

  console.log("top:");
  for (const v of top) {
    console.log(
      `- ${v.name} [${v.severity}] direct=${v.isDirect} range="${v.range}" fix=${v.fix} via=${v.via.join(",")}`
    );
  }
}

const full = readJson("audit-full.json");
const prod = readJson("audit-prod.json");

const fullItems = extractVulns(full);
const prodItems = extractVulns(prod);

printSummary("PROD (omit dev)", prodItems);
printSummary("FULL", fullItems);

// Highlight vulns that only appear when dev deps are included.
const prodNames = new Set(prodItems.map((i) => i.name));
const devOnly = fullItems.filter((i) => !prodNames.has(i.name));

printSummary("DEV-ONLY (present in full, not prod)", devOnly);
