export const APP_NAME = '筋トレノート';

// Base URL for the static files hosted on GitHub Pages or Vercel
// The user can customize this URL later.
export const WEB_HOST_URL = process.env.EXPO_PUBLIC_WEB_HOST_URL || 'https://kentogun0812.github.io/kintore-note';

export const VERSION_CHECK_URL = `${WEB_HOST_URL}/version.json`;
export const PRIVACY_POLICY_URL = `${WEB_HOST_URL}/privacy.html`;
export const TERMS_OF_SERVICE_URL = `${WEB_HOST_URL}/terms.html`;
