/**
 * Which scroll arrows does a horizontally scrolling row need? An arrow appears only while there is
 * content hidden on that side. A 1px tolerance absorbs the sub-pixel rounding browsers do, which
 * would otherwise leave an arrow showing at the very end of the row.
 */
export function scrollEdges(scrollLeft: number, clientWidth: number, scrollWidth: number): { left: boolean; right: boolean } {
  return {
    left: scrollLeft > 1,
    right: scrollLeft + clientWidth < scrollWidth - 1,
  };
}
