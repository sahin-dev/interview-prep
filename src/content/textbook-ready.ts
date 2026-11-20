/**
 * Chapters that have passed the long-form textbook standard: context and motivation,
 * internal mechanics, progressive examples, alternatives and trade-offs, production
 * considerations, misconceptions, interview reasoning, assessment and authoritative sources.
 *
 * Keep this deliberately conservative. A registered lesson is not automatically textbook-ready.
 */
export const textbookReadySlugs = ["indexing", "transactions", "storage-engines"] as const;

export const textbookReadySet = new Set<string>(textbookReadySlugs);
