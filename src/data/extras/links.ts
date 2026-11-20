/**
 * Shared types and link helpers for lesson extras (common mistakes, interview Q&A, further resources).
 * Every external URL used through these helpers was checked to resolve when it was added.
 */
export type ResourceKind = "Article" | "Visualizer" | "Reference" | "Practice" | "Book";

export interface Resource {
  title: string;
  url: string;
  kind: ResourceKind;
  /** Short note on why this link is worth opening. */
  note?: string;
}

export interface FaqItem {
  q: string;
  a: string;
  level?: "Easy" | "Medium" | "Hard";
}

export interface LessonExtras {
  /** Mistakes people make with this topic in interviews. Omitted when the lesson already has its own section. */
  mistakes?: string[];
  /** Interview questions with model answers, for lessons that don't embed a Q&A block. */
  faq?: FaqItem[];
  resources: Resource[];
}

/** cp-algorithms.com: rigorous articles with proofs and reference code. */
export const cp = (path: string, title: string, note?: string): Resource => ({
  title, url: `https://cp-algorithms.com/${path}.html`, kind: "Article", note,
});
/** VisuAlgo: step-through animations. */
export const vg = (path: string, title: string, note?: string): Resource => ({
  title, url: `https://visualgo.net/en/${path}`, kind: "Visualizer", note,
});
/** USFCA (David Galles) data structure visualizations. */
export const us = (page: string, title: string, note?: string): Resource => ({
  title, url: `https://www.cs.usfca.edu/~galles/visualization/${page}.html`, kind: "Visualizer", note,
});
/** Wikipedia: definitions, history and variants. */
export const wp = (page: string, title: string, note?: string): Resource => ({
  title, url: `https://en.wikipedia.org/wiki/${page}`, kind: "Reference", note,
});
/** USACO Guide: modules with curated practice. */
export const ug = (path: string, title: string, note?: string): Resource => ({
  title, url: `https://usaco.guide/${path}`, kind: "Article", note,
});

export const CSES_BOOK: Resource = {
  title: "Competitive Programmer's Handbook (free PDF)", url: "https://cses.fi/book/book.pdf", kind: "Book",
  note: "Short, clear chapters on almost every DSA topic.",
};
export const CSES_PROBLEMS: Resource = {
  title: "CSES Problem Set", url: "https://cses.fi/problemset/", kind: "Practice",
  note: "300 classic problems grouped by technique, with an online judge.",
};
