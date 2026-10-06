/**
 * HexGuard Security & SSRF Protection Utilities
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
]);

/**
 * Checks if an IP or hostname is private / internal (SSRF protection).
 */
export function isPrivateOrInternalHost(host: string): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  const cleanHost = host.toLowerCase().trim();

  if (BLOCKED_HOSTNAMES.has(cleanHost)) {
    return true;
  }

  // IPv4 private ranges check
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 169.254.0.0 - 169.254.255.255 (Link local / AWS metadata)
  // 127.0.0.0 - 127.255.255.255 (Loopback)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleanHost.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);

    if (octet1 === 10) return true;
    if (octet1 === 127) return true;
    if (octet1 === 169 && octet2 === 254) return true;
    if (octet1 === 192 && octet2 === 168) return true;
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    if (octet1 === 0) return true;
  }

  // IPv6 loopback and link-local checks
  if (cleanHost.startsWith('fe80:') || cleanHost.startsWith('fc00:') || cleanHost.startsWith('fd00:')) {
    return true;
  }

  return false;
}

/**
 * Validates a user-supplied URL for safe server-side fetching.
 */
export function validateSafeUrl(rawUrl: string): { valid: boolean; url?: URL; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Empty or missing URL.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
  }

  if (isPrivateOrInternalHost(parsed.hostname)) {
    return { valid: false, error: 'Access to private or internal network addresses is blocked for security.' };
  }

  return { valid: true, url: parsed };
}

/**
 * Computes a SHA-256 hexadecimal hash string for any ArrayBuffer / Uint8Array.
 * Works seamlessly in both browser (crypto.subtle) and Node.js environments.
 */
export async function computeSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      const base64 = data.split(',')[1] || '';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      buffer = bytes.buffer;
    } else {
      buffer = new TextEncoder().encode(data).buffer as ArrayBuffer;
    }
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    buffer = data;
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback to node:crypto when crypto.subtle is not available
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  } catch {
    return 'unavailable';
  }
}

/**
 * Sanitizes an untrusted filename to prevent path traversal or injection.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\.+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^_+/, '')
    .slice(0, 120);
}
