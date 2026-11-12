/**
 * Student classes / batches.
 *
 * A student can belong to more than one class. They are stored in the
 * existing User.studentClass text field as a comma-separated list,
 * e.g. "PU I, PU II" — the same way Course.targetClass lists its classes.
 * No database change is needed, and older single values ("PU II") still work.
 */

export const CLASS_OPTIONS = [
  "10th",
  "PU I",
  "PU II",
  "UG I",
  "UG II",
  "UG III",
  "PG I",
  "PG II",
  "10th FC",
  "PUC FC",
  "UG FC",
  "PG FC",
] as const;

/** "PU I, PU II" → ["PU I", "PU II"]. Also accepts ";" and "|" (handy in CSV files). */
export function parseClasses(value?: string | null): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(/[,;|]/)) {
    const c = raw.trim().replace(/\s+/g, " ");
    const key = c.toLowerCase();
    if (c && !seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

/** ["PU II", "PU I"] → "PU I, PU II" (listed in the standard order, unknown classes last). */
export function joinClasses(list: string[]): string {
  const order = (c: string) => {
    const i = CLASS_OPTIONS.findIndex((o) => o.toLowerCase() === c.toLowerCase());
    return i === -1 ? CLASS_OPTIONS.length : i;
  };
  return parseClasses(list.join(","))
    .sort((a, b) => order(a) - order(b))
    .join(", ");
}

/** Cleans whatever was sent (string with separators) into the stored form, or undefined if empty. */
export function normalizeClasses(value?: string | null): string | undefined {
  const joined = joinClasses(parseClasses(value));
  return joined || undefined;
}

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/**
 * Can a student with these classes see a course for courseTarget?
 * - Course with no target class, or "all": everyone.
 * - Otherwise: if ANY of the student's classes is one of the course's classes.
 */
export function classAllowed(courseTarget: string | null | undefined, studentClass: string | null | undefined): boolean {
  if (!courseTarget || courseTarget.trim() === "") return true;
  const allowed = courseTarget.split(",").map((c) => squash(c.trim()));
  if (allowed.includes("all")) return true;
  return parseClasses(studentClass).some((c) => allowed.includes(squash(c)));
}
