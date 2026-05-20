const SEARCH_BASE = "https://search.withampersand.com/v1";
const WRITE_BASE = "https://write.withampersand.com/v1";
const API_BASE = "https://api.withampersand.com/v1";

export type FieldFilter = {
  fieldName: string;
  operator: "eq";
  value: unknown;
};

/**
 * Search for records in a customer's connected provider.
 * Returns synchronously with at most a single page of matching results.
 *
 * @example
 * const { results } = await search(
 *   projectId, integrationId, groupRef, apiKey,
 *   "now/table/incident",
 *   [{ fieldName: "ticketNumber", operator: "eq", value: "INC0008111" }],
 * );
 * const incident = results[0];
 * console.log(incident.mappedFields.status);
 */
export async function search(
  projectId: string,
  integrationId: string,
  groupRef: string,
  apiKey: string,
  objectName: string,
  fieldFilters: FieldFilter[],
) {
  const resp = await fetch(
    `${SEARCH_BASE}/projects/${projectId}/integrations/${integrationId}?groupRef=${groupRef}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-amp-request-type": "search",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ objectName, fieldFilters }),
    },
  );
  return resp.json();
}

/**
 * Synchronously write a record. Returns once the provider has accepted
 * the write, with the new record's id.
 *
 * @example
 * const { recordId } = await write(
 *   projectId, integrationId, groupRef, apiKey,
 *   "case",
 *   { ContactId: "003...", Subject: "Conversation handoff", Origin: "voice" },
 * );
 */
export async function write(
  projectId: string,
  integrationId: string,
  groupRef: string,
  apiKey: string,
  objectName: string,
  record: Record<string, unknown>,
  type: "create" | "update" | "delete" = "create",
) {
  const resp = await fetch(
    `${WRITE_BASE}/projects/${projectId}/integrations/${integrationId}/objects/${encodeURIComponent(objectName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ groupRef, type, record }),
    },
  );
  return resp.json();
}

/**
 * Asynchronously write a record. Returns immediately with an operationId;
 * the write is processed in the background with auto-retry. Use
 * getOperation() to poll status. Recommended for large records, batches,
 * or whenever you don't need to block on the result.
 *
 * @example
 * const { operationId } = await writeAsync(
 *   projectId, integrationId, groupRef, apiKey,
 *   "task",
 *   { WhoId: contactId, WhatId: caseId, Description: transcript },
 * );
 * // ...later
 * const op = await getOperation(projectId, operationId, apiKey);
 * if (op.status === "success") { ... }
 */
export async function writeAsync(
  projectId: string,
  integrationId: string,
  groupRef: string,
  apiKey: string,
  objectName: string,
  record: Record<string, unknown>,
  type: "create" | "update" | "delete" = "create",
) {
  const resp = await fetch(
    `${WRITE_BASE}/projects/${projectId}/integrations/${integrationId}/objects/${encodeURIComponent(objectName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ groupRef, type, mode: "asynchronous", record }),
    },
  );
  return resp.json();
}

/**
 * Poll the status of an async write operation by its operationId.
 * Returns { status: "in_progress" | "success" | "failure", result, ... }.
 *
 * @example
 * const op = await getOperation(projectId, operationId, apiKey);
 * if (op.status === "failure") {
 *   console.error("write failed:", op.result);
 * }
 */
export async function getOperation(
  projectId: string,
  operationId: string,
  apiKey: string,
) {
  const resp = await fetch(
    `${API_BASE}/projects/${projectId}/operations/${operationId}`,
    {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
      },
    },
  );
  return resp.json();
}
