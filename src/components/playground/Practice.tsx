import { problemById } from "@/data/problems";
import { PracticeClient } from "./PracticeClient";

/**
 * Server wrapper: looks the problems up at build time and passes only these to the client,
 * so a lesson page doesn't ship the whole problem bank.
 */
export function Practice({ ids }: { ids: string[] }) {
  const list = ids.map((id) => {
    const p = problemById.get(id);
    if (!p) throw new Error(`<Practice>: unknown problem id "${id}"`);
    return p;
  });
  if (!list.length) return null;
  return <PracticeClient list={list} />;
}
