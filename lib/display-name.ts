/**
 * Standard display-name formatting utility.
 * Enforces the first-name-only display rule across all listing cards, detail pages,
 * and public surfaces (TRD §2.1a, rules.md §4).
 * 
 * Never hand-roll `.split(' ')[0]` in a component; always import and use firstName().
 */
export function firstName(fullName: string): string {
  if (!fullName) return 'Student';
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
