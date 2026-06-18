import { supabase } from './supabaseClient';

// Parse a stored Supabase storage URL into { bucket, path }.
// Handles both public (/object/public/<bucket>/<path>) and
// authenticated (/object/<bucket>/<path>) forms.
export function parseStorageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/\/storage\/v1\/object\/(?:public\/|sign\/)?([^/?]+)\/([^?]+)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

// Convert a stored storage URL into a short-lived signed URL.
// Falls back to the original URL if it isn't a parseable storage URL or
// signing fails (so display never hard-breaks).
export async function getSignedUrl(url, expiresIn = 3600) {
  const parsed = parseStorageUrl(url);
  if (!parsed) return url || null;
  const { data, error } = await supabase
    .storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresIn);
  if (error || !data?.signedUrl) return url || null;
  return data.signedUrl;
}

// Sign an array of stored URLs (used by photo galleries).
export async function getSignedUrls(urls, expiresIn = 3600) {
  return Promise.all((urls || []).map((u) => getSignedUrl(u, expiresIn)));
}
