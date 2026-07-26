"use client";

const KEY = "casefile.cases.v1";

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(cases) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cases));
}

export function listCases() {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getCase(id) {
  return readAll().find((c) => c.id === id) || null;
}

export function saveCase(caseObj) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === caseObj.id);
  if (idx >= 0) {
    all[idx] = caseObj;
  } else {
    all.push(caseObj);
  }
  writeAll(all);
  return caseObj;
}

export function deleteCase(id) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function newId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
