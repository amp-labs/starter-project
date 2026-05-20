// UC2 — ServiceNow mid-conversation incident lookup.
//
// Usage:
//   npm run uc2 -- <ticketNumber> <expectedCallerSysId>
//
// Example:
//   npm run uc2 -- INC0008111 6816f79cc0a8016401c5a33be04be441

import { search } from "../src/lib/ampersand";

const [ticketNumber, expectedCallerSysId] = process.argv.slice(2);

if (!ticketNumber || !expectedCallerSysId) {
  console.error("Usage: npm run uc2 -- <ticketNumber> <expectedCallerSysId>");
  process.exit(1);
}

const projectId = process.env.AMP_PROJECT_ID!;
const integrationId = process.env.AMP_SN_INTEGRATION_ID!;
const groupRef = process.env.AMP_GROUP_REF!;
const apiKey = process.env.AMP_API_KEY!;

const mask = (s: string | undefined) =>
  !s ? "<MISSING>" : s.length < 12 ? s : `${s.slice(0, 8)}…${s.slice(-4)} (len=${s.length})`;

console.log("Env loaded:");
console.log(`  AMP_PROJECT_ID         = ${projectId ?? "<MISSING>"}`);
console.log(`  AMP_SN_INTEGRATION_ID  = ${integrationId ?? "<MISSING>"}`);
console.log(`  AMP_GROUP_REF          = ${groupRef ?? "<MISSING>"}`);
console.log(`  AMP_API_KEY            = ${mask(apiKey)}`);
console.log();

if (!projectId || !integrationId || !groupRef || !apiKey) {
  console.error("One or more required env vars are missing. Check .env.");
  process.exit(1);
}

const t0 = Date.now();
const searchResp = await search(
  projectId,
  integrationId,
  groupRef,
  apiKey,
  "now/table/incident",
  [{ fieldName: "ticketNumber", operator: "eq", value: ticketNumber }],
);
const elapsed = Date.now() - t0;

// Note: the search service uses `omitempty` so a zero-match response
// is `{}` rather than `{results: []}`. Treat missing results as empty.
const results = searchResp?.results ?? [];

const incident = results[0];
if (!incident) {
  console.error(`No incident found with ticketNumber=${ticketNumber}`);
  console.error("Raw response:", JSON.stringify(searchResp, null, 2));
  process.exit(1);
}

console.log(`[${elapsed}ms] Found incident.`);
console.log("Mapped fields:", incident.mappedFields);

const actualCaller = incident.mappedFields.callerIdentifier?.value;
if (actualCaller !== expectedCallerSysId) {
  console.error(
    `\nCaller mismatch — expected ${expectedCallerSysId}, got ${actualCaller}`,
  );
  process.exit(1);
}

console.log(
  `\nCaller validated. Status to speak back: ${incident.mappedFields.status}`,
);
