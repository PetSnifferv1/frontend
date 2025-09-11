const resolveApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;

  // Prefer explicit env when provided
  let base = envUrl && envUrl.trim().length > 0 ? envUrl.trim() : '';

  // If no env provided, use same-origin (empty string keeps paths like /auth, /pets)
  if (!base) {
    return '';
  }

  try {
    // Normalize and enforce HTTPS when the page is HTTPS to avoid mixed content
    const pageIsHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
    const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : undefined);
    // If env points to a raw AWS ELB hostname, prefer same-origin to avoid certificate CN errors
    if (/\.elb\.amazonaws\.com(?:\.|$)/i.test(url.hostname)) {
      return '';
    }
    if (pageIsHttps && url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    // Remove trailing slash for consistent concatenation
    const normalized = url.toString().replace(/\/$/, '');
    return normalized;
  } catch {
    // If env is a relative path like /api, just return it as-is
    return base.replace(/\/$/, '');
  }
};

export const API_BASE_URL = resolveApiBaseUrl();

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    delete: `${API_BASE_URL}/auth/delete`,
  },
  // ... outros endpoints
};
