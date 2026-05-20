// UC1 — Salesforce conversation-to-CRM handoff.
// Find Contact by email, create a Case linked to it, then create a Task
// with the transcript linked to both Case and Contact.
//
// Usage:
//   npm run uc1 -- <customerEmail> "<transcript>"
//
// Example:
//   npm run uc1 -- customer@example.com "Customer called about their order status."

import { search, write } from "../src/lib/ampersand";

const [customerEmail, ...transcriptParts] = process.argv.slice(2);
const transcript = transcriptParts.join(" ");

if (!customerEmail || !transcript) {
  console.error('Usage: npm run uc1 -- <customerEmail> "<transcript>"');
  process.exit(1);
}

const projectId = process.env.AMP_PROJECT_ID!;
const integrationId = process.env.AMP_SF_INTEGRATION_ID!;
const groupRef = process.env.AMP_GROUP_REF!;
const apiKey = process.env.AMP_API_KEY!;

const mask = (s: string | undefined) =>
  !s ? "<MISSING>" : s.length < 12 ? s : `${s.slice(0, 8)}…${s.slice(-4)} (len=${s.length})`;

console.log("Env loaded:");
console.log(`  AMP_PROJECT_ID         = ${projectId ?? "<MISSING>"}`);
console.log(`  AMP_SF_INTEGRATION_ID  = ${integrationId ?? "<MISSING>"}`);
console.log(`  AMP_GROUP_REF          = ${groupRef ?? "<MISSING>"}`);
console.log(`  AMP_API_KEY            = ${mask(apiKey)}`);
console.log();

if (!projectId || !integrationId || !groupRef || !apiKey) {
  console.error("One or more required env vars are missing. Check .env.");
  process.exit(1);
}

// 1. Find the Contact by email — create it if not found.
const t0 = Date.now();
const searchResp = await search(
  projectId,
  integrationId,
  groupRef,
  apiKey,
  "contact",
  [{ fieldName: "email", operator: "eq", value: customerEmail }],
);
const t1 = Date.now();

// Note: the search service uses `omitempty` so a zero-match response
// is `{}` rather than `{results: []}`. Treat missing results as empty.
const results = searchResp?.results ?? [];

let contactId: string;

if (results[0]) {
  contactId = results[0].fields.Id;
  console.log(`[${t1 - t0}ms] Search Contact → ${contactId} (found)`);
} else {
  // No matching Contact — write a new one. Salesforce requires LastName.
  const lastName = customerEmail.split("@")[0] || "Customer";
  const createResp = await write(
    projectId,
    integrationId,
    groupRef,
    apiKey,
    "contact",
    { Email: customerEmail, LastName: lastName },
  );
  const createdId = createResp?.result?.recordId ?? createResp?.recordId;
  if (!createdId) {
    console.error("Contact create failed:", createResp);
    process.exit(1);
  }
  contactId = createdId;
  console.log(`[${t1 - t0}ms] Search Contact → not found, created → ${contactId}`);
}

const t1b = Date.now();

// 2. Create the Case
const caseResp = await write(
  projectId,
  integrationId,
  groupRef,
  apiKey,
  "case",
  {
    ContactId: contactId,
    Subject: "Conversation handoff",
    Origin: "Phone",
    Status: "New",
  },
);
const t2 = Date.now();

const caseId = caseResp?.result?.recordId ?? caseResp?.recordId;
if (!caseId) {
  console.error("Case write failed:", caseResp);
  process.exit(1);
}
console.log(`[${t2 - t1b}ms] Write Case  → ${caseId}`);

// 3. Create the Task with the transcript, linked to Case + Contact
const taskResp = await write(
  projectId,
  integrationId,
  groupRef,
  apiKey,
  "task",
  {
    WhoId: contactId,
    WhatId: caseId,
    Subject: "Conversation transcript",
    Description: transcript,
  },
);
const t3 = Date.now();

const taskId = taskResp?.result?.recordId ?? taskResp?.recordId;
if (!taskId) {
  console.error("Task write failed:", taskResp);
  process.exit(1);
}
console.log(`[${t3 - t2}ms] Write Task  → ${taskId}`);

console.log(`\nTotal: ${t3 - t0}ms`);
