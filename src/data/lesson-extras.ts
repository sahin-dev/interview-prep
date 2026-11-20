import { advancedExtras } from "./extras/advanced";
import { coreExtras } from "./extras/core";
import type { LessonExtras } from "./extras/links";

export type { FaqItem, LessonExtras, Resource, ResourceKind } from "./extras/links";

/**
 * Common mistakes, interview Q&A and further resources for the DSA lessons (sections 1–8).
 * Rendered by LessonWrapUp after the lesson body.
 */
export const lessonExtras: Record<string, LessonExtras> = { ...coreExtras, ...advancedExtras };
