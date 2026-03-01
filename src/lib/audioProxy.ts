const PROXY_BASE = "https://oneokrock.szymixsiorek.workers.dev";

interface ProxyResult {
  proxyUrl: string;
  expiresAt: number;
}

// Cache tokens so we don't fetch a new one for every play event
const tokenCache = new Map<string, ProxyResult>();

export async function getProxiedAudioUrl(supabaseUrl: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cached = tokenCache.get(supabaseUrl);

  // Use cached token if it's still valid for at least 5 minutes
  if (cached && cached.expiresAt - now > 300) {
    return cached.proxyUrl;
  }

  const res = await fetch(
    `${PROXY_BASE}/token?url=${encodeURIComponent(supabaseUrl)}`
  );

  if (!res.ok) {
    throw new Error(`Audio proxy token fetch failed: ${res.status}`);
  }

  const data: ProxyResult = await res.json();
  tokenCache.set(supabaseUrl, data);
  return data.proxyUrl;
}
