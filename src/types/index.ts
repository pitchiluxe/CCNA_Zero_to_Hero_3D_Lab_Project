export type DeviceType = 'router' | 'switch' | 'pc' | 'server' | 'ap' | 'rack';

export interface Interface {
  id: string;
  name: string;
  mac: string;
  ip?: string;
  mask?: string;
  gateway?: string;
  vlan?: number;
  mode?: 'access' | 'trunk';
  trunkAllowed?: number[];
  connectedTo?: string;
  status: 'up' | 'down';
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  interfaces: Interface[];
  x: number;
  y: number;
  z: number;
  status: 'up' | 'down' | 'error';
  color?: string;
}

export interface Cable {
  id: string;
  from: string;
  fromInterface: string;
  to: string;
  toInterface: string;
  status: 'up' | 'down';
}

export interface LabTask {
  id: string;
  description: string;
  requires?: string;
}

export interface MacTableEntry {
  mac: string;
  port: string;
  deviceId: string;
}

export interface Lab {
  id: string;
  phaseId: string;
  title: string;
  summary: string;
  objectives: string[];
  devices: Device[];
  cables: Cable[];
  interactive?: boolean;
  tasks?: LabTask[];
  view?: '3d' | 'flow' | 'subnet' | 'ipv6' | 'ios' | 'stp' | 'etherchannel' | 'routing' | 'static' | 'ospf' | 'dhcp' | 'dns' | 'nat' | 'acl' | 'wireless' | 'security' | 'automation' | 'wireshark' | 'troubleshoot' | 'capstone' | 'examprep' | 'portfolio' | 'career';
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  summary: string;
  labs: string[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}
