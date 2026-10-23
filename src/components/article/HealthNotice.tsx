/**
 * Shown under every Healthcare story. We summarise what the cited sources report; we are not a
 * source of medical advice, and the page should say so plainly.
 */
export function HealthNotice() {
  return (
    <p role="note" className="mt-8 rounded-card border border-line bg-surface p-4 text-small text-ink-muted">
      <strong className="text-ink">For information only.</strong> This article summarises what the sources above report. It is
      not medical advice. Talk to a qualified health professional about your own health.
    </p>
  );
}
