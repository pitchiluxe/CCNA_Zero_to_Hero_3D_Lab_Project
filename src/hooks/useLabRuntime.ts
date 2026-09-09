import { useState, useEffect, useCallback } from 'react';
import { Device, Cable, Lab, DeviceType, MacTableEntry } from '../types';
import {
  isValidIp,
  isValidMask,
  isHostAddress,
  isSameSubnet,
  getNetworkAddress,
} from '../utils/ip';

export interface Frame {
  id: string;
  from: string;
  to: string;
  start: number;
  srcMac?: string;
  dstMac?: string;
}

export interface MacTables {
  [switchId: string]: Record<string, MacTableEntry>;
}

function uuid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getFreeInterface(device: Device, cables: Cable[]) {
  return device.interfaces.find((iface) => {
    return !cables.some(
      (c) =>
        (c.from === device.id && c.fromInterface === iface.id) ||
        (c.to === device.id && c.toInterface === iface.id)
    );
  });
}

function getInterfaceStatus(deviceId: string, ifaceId: string, devices: Device[]) {
  const dev = devices.find((d) => d.id === deviceId);
  const iface = dev?.interfaces.find((i) => i.id === ifaceId);
  return iface?.status ?? 'down';
}

function getMacFor(device: Device, ifaceId: string) {
  return device.interfaces.find((i) => i.id === ifaceId)?.mac ?? '?';
}

function getIpFor(device: Device, ifaceId: string) {
  const iface = device.interfaces.find((i) => i.id === ifaceId);
  return { ip: iface?.ip, mask: iface?.mask, gateway: iface?.gateway };
}

function defaultInterfaces(type: DeviceType) {
  if (type === 'switch') {
    return [
      { id: 'g0/1', name: 'GigabitEthernet0/1', mac: generateMac(), status: 'up' as const },
      { id: 'g0/2', name: 'GigabitEthernet0/2', mac: generateMac(), status: 'up' as const },
      { id: 'g0/3', name: 'GigabitEthernet0/3', mac: generateMac(), status: 'up' as const },
      { id: 'g0/4', name: 'GigabitEthernet0/4', mac: generateMac(), status: 'up' as const },
    ];
  }
  if (type === 'router') {
    return [{ id: 'g0/0', name: 'GigabitEthernet0/0', mac: generateMac(), status: 'up' as const }];
  }
  if (type === 'server') {
    return [{ id: 'eth0', name: 'Ethernet0', mac: generateMac(), status: 'up' as const }];
  }
  if (type === 'ap') {
    return [{ id: 'eth0', name: 'Ethernet0', mac: generateMac(), status: 'up' as const }];
  }
  return [{ id: 'nic0', name: 'Ethernet0', mac: generateMac(), status: 'up' as const }];
}

let macCounter = 0;
function generateMac() {
  macCounter += 1;
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `00:1a:2b:${hex(macCounter)}:${hex(macCounter)}:${hex(macCounter)}`;
}

function getDeviceColor(type: DeviceType) {
  const map: Record<DeviceType, string> = {
    rack: '#334155',
    router: '#049fd9',
    switch: '#22c55e',
    pc: '#94a3b8',
    server: '#64748b',
    ap: '#f8fafc',
  };
  return map[type];
}

function nextPosition(index: number) {
  const slots = [
    { x: -2.5, z: 2 },
    { x: -1, z: 2 },
    { x: 0.5, z: 2 },
    { x: 2, z: 2 },
    { x: 2, z: -2 },
    { x: 0.5, z: -2 },
    { x: -1, z: -2 },
    { x: -2.5, z: -2 },
  ];
  return slots[index % slots.length];
}

export interface LabRuntime {
  devices: Device[];
  cables: Cable[];
  frames: Frame[];
  macTables: MacTables;
  addDevice: (type: DeviceType, name?: string) => void;
  removeDevice: (id: string) => void;
  toggleInterface: (deviceId: string, ifaceId: string) => void;
  setIp: (deviceId: string, ifaceId: string, ip: string) => void;
  setMask: (deviceId: string, ifaceId: string, mask: string) => void;
  setGateway: (deviceId: string, ifaceId: string, gateway: string) => void;
  setVlan: (deviceId: string, ifaceId: string, vlan: number) => void;
  setMode: (deviceId: string, ifaceId: string, mode: 'access' | 'trunk') => void;
  setTrunkAllowed: (deviceId: string, ifaceId: string, allowed: number[]) => void;
  ping: (sourceId: string, targetIp: string) => string;
  checkIPv4Issues: () => string[];
  connect: (fromId: string, toId: string) => boolean;
  removeCable: (cableId: string) => void;
  toggleCable: (cableId: string) => void;
  sendPacket: (fromId: string, toId: string) => void;
  sendFrame: (fromId: string, toId: 'broadcast' | string) => void;
  clearMacTable: (switchId: string) => void;
  reset: () => void;
}

export function useLabRuntime(lab: Lab): LabRuntime {
  const [devices, setDevices] = useState<Device[]>(lab.devices);
  const [cables, setCables] = useState<Cable[]>(lab.cables);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [macTables, setMacTables] = useState<MacTables>({});

  useEffect(() => {
    setDevices(lab.devices);
    setCables(lab.cables);
    setFrames([]);
    setMacTables({});
  }, [lab.id]);

  const reset = useCallback(() => {
    setDevices(lab.devices);
    setCables(lab.cables);
    setFrames([]);
    setMacTables({});
  }, [lab]);

  const addFrame = useCallback((frame: Frame) => {
    setFrames((prev) => [...prev, frame]);
    setTimeout(() => {
      setFrames((prev) => prev.filter((f) => f.id !== frame.id));
    }, 2000);
  }, []);

  const updateInterface = useCallback((deviceId: string, ifaceId: string, update: Partial<Pick<Device['interfaces'][0], 'ip' | 'mask' | 'gateway' | 'vlan' | 'mode' | 'trunkAllowed'>>) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              interfaces: d.interfaces.map((i) => (i.id === ifaceId ? { ...i, ...update } : i)),
            }
          : d
      )
    );
  }, []);

  const setIp = useCallback((deviceId: string, ifaceId: string, ip: string) => {
    updateInterface(deviceId, ifaceId, { ip });
  }, [updateInterface]);

  const setMask = useCallback((deviceId: string, ifaceId: string, mask: string) => {
    updateInterface(deviceId, ifaceId, { mask });
  }, [updateInterface]);

  const setGateway = useCallback((deviceId: string, ifaceId: string, gateway: string) => {
    updateInterface(deviceId, ifaceId, { gateway });
  }, [updateInterface]);

  const setVlan = useCallback((deviceId: string, ifaceId: string, vlan: number) => {
    updateInterface(deviceId, ifaceId, { vlan });
  }, [updateInterface]);

  const setMode = useCallback((deviceId: string, ifaceId: string, mode: 'access' | 'trunk') => {
    updateInterface(deviceId, ifaceId, { mode });
  }, [updateInterface]);

  const setTrunkAllowed = useCallback((deviceId: string, ifaceId: string, trunkAllowed: number[]) => {
    updateInterface(deviceId, ifaceId, { trunkAllowed });
  }, [updateInterface]);

  const addDevice = useCallback((type: DeviceType, name?: string) => {
    const existing = devices.filter((d) => d.type === type).length + 1;
    const label =
      name ??
      (type === 'pc'
        ? `PC-${existing}`
        : type === 'router'
        ? `R-${existing}`
        : type === 'server'
        ? `SRV-${existing}`
        : type === 'switch'
        ? `SW-${existing}`
        : type === 'ap'
        ? `AP-${existing}`
        : `Device-${existing}`);
    const id = `${type}-${uuid()}`;
    const pos = nextPosition(devices.length);

    const newDevice: Device = {
      id,
      type,
      name: label,
      x: pos.x,
      y: 0,
      z: pos.z,
      status: 'up',
      color: getDeviceColor(type),
      interfaces: defaultInterfaces(type),
    };
    setDevices((prev) => [...prev, newDevice]);
  }, [devices]);

  const removeDevice = useCallback((id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setCables((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    setMacTables((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const recalcCables = (currentDevices: Device[], currentCables: Cable[]) => {
    return currentCables.map((c) => {
      const a = getInterfaceStatus(c.from, c.fromInterface, currentDevices);
      const b = getInterfaceStatus(c.to, c.toInterface, currentDevices);
      const status = a === 'up' && b === 'up' ? c.status : 'down';
      return { ...c, status };
    });
  };

  const toggleInterface = useCallback((deviceId: string, ifaceId: string) => {
    setDevices((prev) => {
      const next = prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              interfaces: d.interfaces.map((i) =>
                i.id === ifaceId ? { ...i, status: (i.status === 'up' ? 'down' : 'up') as 'up' | 'down' } : i
              ),
            }
          : d
      );
      setCables((cprev) => recalcCables(next, cprev));
      return next;
    });
  }, []);

  const connect = useCallback((fromId: string, toId: string) => {
    const from = devices.find((d) => d.id === fromId);
    const to = devices.find((d) => d.id === toId);
    if (!from || !to || fromId === toId) return false;
    const fi = getFreeInterface(from, cables);
    const ti = getFreeInterface(to, cables);
    if (!fi || !ti) return false;

    const cable: Cable = {
      id: uuid(),
      from: fromId,
      fromInterface: fi.id,
      to: toId,
      toInterface: ti.id,
      status: fi.status === 'up' && ti.status === 'up' ? 'up' : 'down',
    };
    setCables((prev) => [...prev, cable]);
    return true;
  }, [devices, cables]);

  const removeCable = useCallback((cableId: string) => {
    setCables((prev) => prev.filter((c) => c.id !== cableId));
  }, []);

  const toggleCable = useCallback((cableId: string) => {
    setCables((prev) =>
      prev.map((c) => {
        if (c.id !== cableId) return c;
        const nextStatus = c.status === 'up' ? 'down' : 'up';
        return { ...c, status: nextStatus };
      })
    );
  }, []);

  const sendPacket = useCallback((fromId: string, toId: string) => {
    addFrame({ id: uuid(), from: fromId, to: toId, start: performance.now() });
  }, [addFrame]);

  const sendFrame = useCallback((fromId: string, toId: 'broadcast' | string) => {
    const fromDevice = devices.find((d) => d.id === fromId);
    if (!fromDevice) return;

    const inCable = cables.find((c) => c.from === fromId && devices.find((d) => d.id === c.to && d.type === 'switch'));
    if (!inCable) return;

    const switchId = inCable.to;
    const switchPort = inCable.toInterface;
    const sourceMac = getMacFor(fromDevice, inCable.fromInterface);

    setMacTables((prev) => ({
      ...prev,
      [switchId]: {
        ...prev[switchId],
        [sourceMac]: { mac: sourceMac, port: switchPort, deviceId: fromId },
      },
    }));

    const switchCables = cables.filter((c) => c.from === switchId && c.status === 'up');
    const targetCables =
      toId === 'broadcast'
        ? switchCables.filter((c) => c.to !== fromId)
        : switchCables.filter((c) => c.to === toId);

    const now = performance.now();
    addFrame({ id: uuid(), from: fromId, to: switchId, start: now, srcMac: sourceMac });

    targetCables.forEach((c) => {
      const toDevice = devices.find((d) => d.id === c.to);
      const dstMac = toId === 'broadcast' ? 'FF:FF:FF:FF:FF:FF' : (toDevice ? getMacFor(toDevice, c.toInterface) : '?');
      addFrame({ id: uuid(), from: switchId, to: c.to, start: now, srcMac: sourceMac, dstMac });
    });
  }, [devices, cables, addFrame]);

  const clearMacTable = useCallback((switchId: string) => {
    setMacTables((prev) => {
      const next = { ...prev };
      delete next[switchId];
      return next;
    });
  }, []);

  const ping = useCallback((sourceId: string, targetIp: string): string => {
    if (!isValidIp(targetIp)) {
      return 'Invalid target IP address.';
    }

    const source = devices.find((d) => d.id === sourceId);
    if (!source) return 'Source device not found.';

    const sourceIface = source.interfaces[0];
    if (!sourceIface || sourceIface.status === 'down') {
      return 'Source interface is down.';
    }
    if (!sourceIface.ip || !sourceIface.mask) {
      return 'Source device has no IP/mask configured.';
    }

    const sourceUp = sourceIface.status === 'up';
    const sourceIp = sourceIface.ip;
    const sourceMask = sourceIface.mask;

    if (targetIp === sourceIp) {
      return 'Reply from itself: ping successful (localhost).';
    }

    const targetDevice = devices.find((d) => d.interfaces.some((i) => i.ip === targetIp && i.status === 'up'));
    if (!targetDevice) {
      if (targetIp === sourceIface.gateway) {
        return 'Gateway IP is not assigned to an up interface on a connected device.';
      }
      return 'Destination host unreachable (no device with that IP and interface is up).';
    }

    const targetIface = targetDevice.interfaces.find((i) => i.ip === targetIp);
    if (!targetIface || targetIface.status === 'down') {
      return 'Target interface is down.';
    }
    const targetMask = targetIface.mask;
    if (!targetMask) {
      return 'Target device has no mask configured.';
    }

    const sameSubnet = isSameSubnet(sourceIp, targetIp, sourceMask);
    if (sameSubnet) {
      const path = findPath(source.id, targetDevice.id, cables, devices);
      if (!path) return 'No active Layer 2 path to the target.';
      if (!sourceUp) return 'Source interface is down.';
      return `Reply from ${targetIp}: bytes=32 time<1ms TTL=64 (same subnet).`;
    }

    // Different subnet: must use gateway
    if (!sourceIface.gateway) {
      return 'Target is in a different subnet and no default gateway is configured.';
    }
    if (!isSameSubnet(sourceIp, sourceIface.gateway, sourceMask)) {
      return 'Default gateway is not in the same subnet as the source.';
    }
    const gatewayDevice = devices.find((d) => d.interfaces.some((i) => i.ip === sourceIface.gateway && i.status === 'up'));
    if (!gatewayDevice) {
      return 'Default gateway IP is not reachable (no up interface with that IP).';
    }
    const gwPath = findPath(source.id, gatewayDevice.id, cables, devices);
    if (!gwPath) return 'No active Layer 2 path to the default gateway.';
    return `Reply via gateway ${sourceIface.gateway}: bytes=32 time<1ms TTL=63 (routed).`;
  }, [devices, cables]);

  const checkIPv4Issues = useCallback((): string[] => {
    const issues: string[] = [];
    const allIfaces: { device: string; iface: string; ip: string; mask?: string; gateway?: string }[] = [];

    for (const d of devices) {
      for (const i of d.interfaces) {
        if (!i.ip && !i.mask && !i.gateway) continue;
        if (i.ip) allIfaces.push({ device: d.name, iface: i.name, ip: i.ip, mask: i.mask, gateway: i.gateway });
        if (i.ip && !isValidIp(i.ip)) issues.push(`${d.name} ${i.name}: invalid IP address ${i.ip}`);
        if (i.mask && !isValidMask(i.mask)) issues.push(`${d.name} ${i.name}: invalid subnet mask ${i.mask}`);
        if (i.ip && i.mask && !isHostAddress(i.ip, i.mask)) {
          issues.push(`${d.name} ${i.name}: ${i.ip} is not a usable host address with ${i.mask}`);
        }
      }
    }

    for (const a of allIfaces) {
      const dupes = allIfaces.filter((b) => b !== a && b.ip === a.ip);
      for (const d of dupes) {
        issues.push(`Duplicate IP ${a.ip} on ${a.device} ${a.iface} and ${d.device} ${d.iface}`);
      }
    }

    for (const a of allIfaces) {
      if (!a.gateway) continue;
      if (!isValidIp(a.gateway)) {
        issues.push(`${a.device} ${a.iface}: invalid gateway ${a.gateway}`);
        continue;
      }
      if (!a.mask) continue;
      if (!isSameSubnet(a.ip, a.gateway, a.mask)) {
        issues.push(`${a.device} ${a.iface}: gateway ${a.gateway} is not in the same subnet`);
      }
      const gwDevice = devices.find((d) => d.interfaces.some((i) => i.ip === a.gateway && i.status === 'up'));
      if (!gwDevice) {
        issues.push(`${a.device} ${a.iface}: gateway ${a.gateway} is not reachable on an up interface`);
      }
    }

    return Array.from(new Set(issues));
  }, [devices]);

  return {
    devices,
    cables,
    frames,
    macTables,
    addDevice,
    removeDevice,
    toggleInterface,
    setIp,
    setMask,
    setGateway,
    setVlan,
    setMode,
    setTrunkAllowed,
    ping,
    checkIPv4Issues,
    connect,
    removeCable,
    toggleCable,
    sendPacket,
    sendFrame,
    clearMacTable,
    reset,
  };
}

function findPath(a: string, b: string, cables: Cable[], devices: Device[]): boolean {
  // Treat the network as connected if both are connected to a common switch or the same device directly.
  const aCables = cables.filter((c) => c.status === 'up' && (c.from === a || c.to === a));
  const bCables = cables.filter((c) => c.status === 'up' && (c.from === b || c.to === b));

  const aNeighbors = new Set<string>();
  for (const c of aCables) {
    const other = c.from === a ? c.to : c.from;
    aNeighbors.add(other);
  }

  const bNeighbors = new Set<string>();
  for (const c of bCables) {
    const other = c.from === b ? c.to : c.from;
    bNeighbors.add(other);
  }

  // Direct connection
  if (aNeighbors.has(b)) return true;

  // Common switch
  for (const n of aNeighbors) {
    const dev = devices.find((d) => d.id === n);
    if (dev?.type === 'switch' && bNeighbors.has(n)) return true;
  }

  return false;
}
