type EventProps = Record<string, unknown>;

export async function trackEvent(name: string, props: EventProps = {}) {
  // Placeholder: wire to PostHog / Segment / GA server-side API when configured.
  // For now, log to the server console for inspection.
  console.info('[analytics]', name, props);
}
