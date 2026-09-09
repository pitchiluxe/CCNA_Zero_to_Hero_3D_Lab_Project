export function isValidIp(ip: string): boolean {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const p of parts) {
    if (p === '' || !/^\d+$/.test(p)) return false;
    const n = parseInt(p, 10);
    if (n < 0 || n > 255) return false;
  }
  return true;
}

export function isValidMask(mask: string): boolean {
  if (!mask) return false;
  if (mask.startsWith('/')) {
    const n = parseInt(mask.slice(1), 10);
    return !isNaN(n) && n >= 0 && n <= 32;
  }
  return isValidIp(mask);
}

export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  let acc = 0;
  for (const p of parts) {
    acc = ((acc * 256 + p) >>> 0);
  }
  return acc;
}

export function numberToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

export function prefixToMask(prefix: number): string | null {
  if (prefix < 0 || prefix > 32) return null;
  if (prefix === 0) return '0.0.0.0';
  return numberToIp((0x100000000 - Math.pow(2, 32 - prefix)) >>> 0);
}

export function maskToPrefix(mask: string): number | null {
  if (mask.startsWith('/')) {
    const n = parseInt(mask.slice(1), 10);
    return isNaN(n) ? null : n;
  }
  const m = maskToNumber(mask);
  if (m === null) return null;
  let prefix = 0;
  let n = m >>> 0;
  while (n) {
    n = n & (n - 1);
    prefix++;
  }
  return prefix;
}

export function maskToNumber(mask: string): number | null {
  if (!mask) return null;
  if (mask.startsWith('/')) {
    const prefix = parseInt(mask.slice(1), 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
    if (prefix === 0) return 0;
    return (0x100000000 - Math.pow(2, 32 - prefix)) >>> 0;
  }
  if (!isValidIp(mask)) return null;
  return ipToNumber(mask);
}

export function getNetworkAddress(ip: string, mask: string): string | null {
  if (!isValidIp(ip) || !isValidMask(mask)) return null;
  const ipNum = ipToNumber(ip);
  const maskNum = maskToNumber(mask);
  if (maskNum === null) return null;
  return numberToIp((ipNum & maskNum) >>> 0);
}

export function getBroadcastAddress(ip: string, mask: string): string | null {
  if (!isValidIp(ip) || !isValidMask(mask)) return null;
  const ipNum = ipToNumber(ip);
  const maskNum = maskToNumber(mask);
  if (maskNum === null) return null;
  const network = (ipNum & maskNum) >>> 0;
  const hostBits = ((0xffffffff - maskNum) >>> 0);
  return numberToIp((network + hostBits) >>> 0);
}

export function isSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  if (!isValidIp(ip1) || !isValidIp(ip2) || !isValidMask(mask)) return false;
  const m = maskToNumber(mask);
  if (m === null) return false;
  return (ipToNumber(ip1) & m) === (ipToNumber(ip2) & m);
}

export function isNetworkAddress(ip: string, mask: string): boolean {
  return getNetworkAddress(ip, mask) === ip;
}

export function isBroadcastAddress(ip: string, mask: string): boolean {
  const broadcast = getBroadcastAddress(ip, mask);
  return broadcast !== null && broadcast === ip;
}

export function isHostAddress(ip: string, mask: string): boolean {
  return isValidIp(ip) && isValidMask(mask) && !isNetworkAddress(ip, mask) && !isBroadcastAddress(ip, mask);
}
