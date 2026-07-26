"use client";

// Cases now live in Postgres, scoped to the logged-in user. This module
// keeps the same shape as before (listCases/getCase/saveCase/deleteCase)
// but each call is a fetch to our own API instead of localStorage, so the
// rest of the app barely had to change.

export async function listCases() {
  const res = await fetch("/api/cases");
  if (!res.ok) return [];
  const { cases } = await res.json();
  return cases.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getCase(id) {
  const res = await fetch(`/api/cases/${id}`);
  if (!res.ok) return null;
  const { case: c } = await res.json();
  return c;
}

// Creates a brand new case (used right after AI analysis on the intake form).
export async function createCase(caseObj) {
  const res = await fetch("/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(caseObj),
  });
  if (!res.ok) throw new Error("Could not save the new case.");
  const { case: saved } = await res.json();
  return saved;
}

// Updates an existing case (timeline entries, chat history, documents, stage).
export async function saveCase(caseObj) {
  const res = await fetch(`/api/cases/${caseObj.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(caseObj),
  });
  if (!res.ok) throw new Error("Could not save changes to this case.");
  return caseObj;
}

export async function deleteCase(id) {
  await fetch(`/api/cases/${id}`, { method: "DELETE" });
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
