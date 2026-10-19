export type HeadingPosition = { id: string; top: number };

/**
 * Which outline item is "current"? The LAST heading whose top has passed the activation line
 * (headings are given in document order). Before the first heading, the first is current; at
 * the very bottom of the page the last is current, since the final sections may be too short to
 * ever reach the line. Pure, so the rule is unit-tested without a browser.
 */
export function pickActiveId(headings: HeadingPosition[], line: number, atBottom: boolean): string | undefined {
  if (headings.length === 0) return undefined;
  if (atBottom) return headings[headings.length - 1].id;
  let current = headings[0].id;
  for (const h of headings) {
    if (h.top <= line) current = h.id;
    else break;
  }
  return current;
}
