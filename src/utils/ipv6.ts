export function isValidIPv6(ip: string): boolean {
  if (!ip) return false;
  const parts = ip.split('::');
  if (parts.length > 2) return false;

  const left = parts[0] ? parts[0].split(':') : [];
  const right = parts[1] ? parts[1].split(':') : [];

  if (parts.length === 1) {
    if (left.length !== 8) return false;
  } else {
    const filled = left.length + right.length;
    if (filled >= 8) return false;
  }

  for (const group of [...left, ...right]) {
    if (group.length === 0) continue;
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return false;
  }

  return true;
}

function normalizeHex(s: string): string {
  return s.toLowerCase();
}

export function expandIPv6(ip: string): string | null {
  if (!isValidIPv6(ip)) return null;
  const parts = ip.split('::');
  const left = parts[0] ? parts[0].split(':') : [];
  const right = parts[1] ? parts[1].split(':') : [];

  const missing = 8 - left.length - right.length;
  const middle = Array(missing).fill('0000');
  const all = [...left, ...middle, ...right];
  return all.map((g) => g.padStart(4, '0').toLowerCase()).join(':');
}

export function compressIPv6(ip: string): string | null {
  const expanded = expandIPv6(ip);
  if (!expanded) return null;
  const groups = expanded.split(':').map((g) => g.replace(/^0+(?=[1-9a-fA-F]|$)/, ''));
  if (groups.every((g) => g === '0')) return '::';

  let bestStart = -1;
  let bestLen = 0;
  let currentStart = -1;
  let currentLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (currentStart === -1) currentStart = i;
      currentLen++;
    } else {
      if (currentLen > bestLen) {
        bestLen = currentLen;
        bestStart = currentStart;
      }
      currentStart = -1;
      currentLen = 0;
    }
  }
  if (currentLen > bestLen) {
    bestLen = currentLen;
    bestStart = currentStart;
  }

  if (bestLen > 1) {
    const head = groups.slice(0, bestStart).join(':');
    const tail = groups.slice(bestStart + bestLen).join(':');
    const res = `${head}::${tail}`;
    return res.replace(/^:+|:+$/g, '');
  }

  return groups.join(':');
}

function toHex(n: number): string {
  return n.toString(16).padStart(4, '0').toLowerCase();
}

export function macToEUI64(mac: string): string | null {
  const clean = mac.replace(/-/g, ':').split(':').map((p) => p.trim().toLowerCase());
  if (clean.length !== 6) return null;
  for (const p of clean) {
    if (!/^[0-9a-fA-F]{2}$/.test(p)) return null;
  }

  const first = parseInt(clean[0], 16);
  const flipped = (first ^ 0x02) << 8;
  const firstGroup = toHex(flipped + parseInt(clean[1], 16));
  const eui = [firstGroup, clean[2] + 'ff', 'fe' + clean[3], clean[4] + clean[5]];
  return eui.join(':');
}

export function generateLinkLocal(mac: string): string | null {
  const eui = macToEUI64(mac);
  if (!eui) return null;
  return `fe80::${eui}`;
}

export function generateSLAAC(prefix: string, mac: string): string | null {
  const [addr] = prefix.split('/');
  if (!addr.includes('::')) return null;
  const prefixExpanded = expandIPv6(addr);
  if (!prefixExpanded) return null;
  const eui = macToEUI64(mac);
  if (!eui) return null;
  const prefixParts = prefixExpanded.split(':');
  const euiParts = eui.split(':');
  return compressIPv6(prefixParts.slice(0, 4).concat(euiParts).join(':'));
}

export type IPv6Type =
  | 'unspecified'
  | 'loopback'
  | 'multicast'
  | 'link-local'
  | 'unique-local'
  | 'global-unicast'
  | 'unknown';

export function getIPv6Type(ip: string): IPv6Type {
  if (!isValidIPv6(ip)) return 'unknown';
  const expanded = expandIPv6(ip);
  if (!expanded) return 'unknown';
  const first = expanded.split(':')[0];
  const asNumber = parseInt(first, 16) >>> 0;

  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') return 'unspecified';
  if (expanded === '0000:0000:0000:0000:0000:0000:0000:0001') return 'loopback';
  if ((asNumber & 0xff00) === 0xff00) return 'multicast';
  if ((asNumber & 0xffc0) === 0xfe80) return 'link-local';
  if ((asNumber & 0xfe00) === 0xfc00) return 'unique-local';
  if ((asNumber & 0xe000) === 0x2000) return 'global-unicast';
  return 'unknown';
}
