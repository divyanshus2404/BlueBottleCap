import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;
let initialized = false;

export function initSentry() {
  if (!dsn || initialized) return;
  Sentry.init({ dsn, tracesSampleRate: 0.1 });
  initialized = true;
}

export function captureException(err: unknown) {
  if (!initialized) return;
  Sentry.captureException(err);
}
