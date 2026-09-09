import { isValidIp, isValidMask, getNetworkAddress, getBroadcastAddress, maskToNumber, ipToNumber, numberToIp, maskToPrefix } from './ip';

export function countUsableHosts(mask: string): number {
  const prefix = maskToPrefix(mask);
  if (prefix === null) return 0;
  const hostBits = 32 - prefix;
  return Math.max(0, Math.pow(2, hostBits) - 2);
}

export function getFirstUsableHost(network: string, mask: string): string | null {
  if (!isValidIp(network) || !isValidMask(mask)) return null;
  const net = ipToNumber(network);
  return numberToIp((net + 1) >>> 0);
}

export function getLastUsableHost(broadcast: string, mask: string): string | null {
  if (!isValidIp(broadcast) || !isValidMask(mask)) return null;
  const bcast = ipToNumber(broadcast);
  return numberToIp((bcast - 1) >>> 0);
}

export interface SubnetResult {
  network: string;
  broadcast: string;
  first: string;
  last: string;
  usable: number;
}

export function getSubnetDetails(network: string, mask: string): SubnetResult | null {
  if (!isValidIp(network) || !isValidMask(mask)) return null;
  const net = getNetworkAddress(network, mask);
  const bcast = getBroadcastAddress(network, mask);
  if (!net || !bcast) return null;
  const first = getFirstUsableHost(net, mask);
  const last = getLastUsableHost(bcast, mask);
  if (!first || !last) return null;
  return {
    network: net,
    broadcast: bcast,
    first,
    last,
    usable: countUsableHosts(mask),
  };
}

export function getSubnets(networkIp: string, networkMask: string, newPrefix: number): SubnetResult[] | null {
  const netAddr = getNetworkAddress(networkIp, networkMask);
  if (!netAddr) return null;
  const netPrefix = maskToPrefix(networkMask);
  if (netPrefix === null || newPrefix < netPrefix || newPrefix > 32) return null;

  const count = Math.pow(2, newPrefix - netPrefix);
  const start = ipToNumber(netAddr);
  const blockSize = Math.pow(2, 32 - newPrefix);
  const subnetMask = (0x100000000 - Math.pow(2, 32 - newPrefix)) >>> 0;

  const subnets: SubnetResult[] = [];
  for (let i = 0; i < count; i++) {
    const base = (start + i * blockSize) >>> 0;
    const bcast = (base + blockSize - 1) >>> 0;
    const first = (base + 1) >>> 0;
    const last = (bcast - 1) >>> 0;
    subnets.push({
      network: numberToIp(base),
      broadcast: numberToIp(bcast),
      first: numberToIp(first),
      last: numberToIp(last),
      usable: Math.max(0, blockSize - 2),
    });
  }
  return subnets;
}

export function prefixForHostCount(hosts: number): number | null {
  if (hosts < 1) return null;
  for (let prefix = 30; prefix >= 1; prefix--) {
    const available = Math.pow(2, 32 - prefix) - 2;
    if (available >= hosts) return prefix;
  }
  return null;
}
