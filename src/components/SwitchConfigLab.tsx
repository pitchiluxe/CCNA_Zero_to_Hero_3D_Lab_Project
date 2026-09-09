import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface InterfaceConfig {
  name: string;
  ip: string;
  mask: string;
  shutdown: boolean;
  protocol: 'up' | 'down';
  switchport?: {
    mode: 'access' | 'trunk';
    portSecurity: boolean;
    maximum: number;
    sticky: boolean;
    violation: 'shutdown' | 'restrict' | 'protect';
  };
}

interface LineConfig {
  type: 'console' | 'vty';
  password?: string;
  login: boolean;
  loginLocal: boolean;
  transport: string[];
}

interface Security {
  enableSecret: string;
  banner: string;
  domain: string;
  defaultGateway: string;
  users: Record<string, string>;
  ssh: boolean;
}

type Mode = 'user' | 'priv' | 'config' | 'config-if' | 'config-line';

export function SwitchConfigLab() {
  const [hostname, setHostname] = useState('Switch');
  const [mode, setMode] = useState<Mode>('user');
  const [currentInterface, setCurrentInterface] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<string | null>(null);
  const [interfaces, setInterfaces] = useState<Record<string, InterfaceConfig>>({
    'vlan 1': { name: 'Vlan1', ip: 'unassigned', mask: '', shutdown: true, protocol: 'down' },
    'gigabitEthernet 0/0': { name: 'GigabitEthernet0/0', ip: 'unassigned', mask: '', shutdown: true, protocol: 'down' },
    'fastEthernet 0/1': {
      name: 'FastEthernet0/1',
      ip: 'unassigned',
      mask: '',
      shutdown: true,
      protocol: 'down',
      switchport: { mode: 'access', portSecurity: false, maximum: 1, sticky: false, violation: 'shutdown' },
    },
  });
  const [lines, setLines] = useState<Record<string, LineConfig>>({
    'console 0': { type: 'console', login: false, loginLocal: false, transport: [] },
    'vty 0 4': { type: 'vty', login: false, loginLocal: false, transport: [] },
  });
  const [security, setSecurity] = useState<Security>({
    enableSecret: '',
    banner: '',
    domain: '',
    defaultGateway: '',
    users: {},
    ssh: false,
  });
  const [saved, setSaved] = useState<ConfigSnapshot | null>(null);
  const [history, setHistory] = useState<string[]>([
    'Switch IOS Simulator',
    "Type '?' for a list of available commands.",
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [objectives, setObjectives] = useState({
    enable: false,
    hostname: false,
    secret: false,
    banner: false,
    vlan: false,
    gateway: false,
    vty: false,
    portSecurity: false,
    save: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const prompt = () => {
    const base = hostname;
    if (mode === 'user') return `${base}>`;
    if (mode === 'priv') return `${base}#`;
    if (mode === 'config') return `${base}(config)#`;
    if (mode === 'config-if') return `${base}(config-if)#`;
    return `${base}(config-line)#`;
  };

  const respond = (msg: string | string[]) => {
    setHistory((prev) => [...prev, ...(Array.isArray(msg) ? msg : [msg])]);
  };

  const normalizeIface = (name: string) => {
    const n = name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (/^v(lan)?\s*1$/.test(n)) return 'vlan 1';
    if (/^g(igabit)?e?(thernet)?\s*0\/0$/.test(n)) return 'gigabitEthernet 0/0';
    if (/^f(ast)?e?(thernet)?\s*0\/1$/.test(n)) return 'fastEthernet 0/1';
    return null;
  };

  const normalizeLine = (name: string) => {
    const n = name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (/^c(onsole)?\s*0$/.test(n)) return 'console 0';
    if (/^v(ty)?\s*0\s*4$/.test(n)) return 'vty 0 4';
    return null;
  };

  const updateInterface = (name: string, update: Partial<InterfaceConfig>) => {
    setInterfaces((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...update },
    }));
  };

  const updateLine = (name: string, update: Partial<LineConfig>) => {
    setLines((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...update },
    }));
  };

  const execute = (raw: string) => {
    const line = raw.trim();
    setHistory((prev) => [...prev, `${prompt()} ${line}`]);
    if (!line) return;
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (line === '?') {
      respond(['Available commands:', ...getCommands(mode)]);
      return;
    }

    if (mode === 'user') {
      if (cmd === 'enable') {
        setMode('priv');
        setObjectives((o) => ({ ...o, enable: true }));
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'priv') {
      if (cmd === 'disable') setMode('user');
      else if (line.toLowerCase().startsWith('configure terminal') || line.toLowerCase().startsWith('conf t')) setMode('config');
      else if (cmd === 'show') handleShow(parts.slice(1));
      else if (cmd === 'write' || (cmd === 'copy' && parts[1]?.toLowerCase() === 'running-config' && parts[2]?.toLowerCase() === 'startup-config')) {
        setSaved({ hostname, interfaces, lines, security });
        setObjectives((o) => ({ ...o, save: true }));
        respond('[OK] Configuration saved to NVRAM.');
      } else respond('% Unknown command.');
      return;
    }

    if (mode === 'config') {
      if (cmd === 'end' || cmd === 'exit') {
        setMode('priv');
        setCurrentInterface(null);
        setCurrentLine(null);
      } else if (cmd === 'hostname' && parts[1]) {
        setHostname(parts[1]);
        setObjectives((o) => ({ ...o, hostname: true }));
        respond(`Hostname set to ${parts[1]}`);
      } else if (cmd === 'enable' && parts[1]?.toLowerCase() === 'secret' && parts[2]) {
        setSecurity((s) => ({ ...s, enableSecret: parts[2] }));
        setObjectives((o) => ({ ...o, secret: true }));
        respond('Enable secret set.');
      } else if (cmd === 'banner' && parts[1]?.toLowerCase() === 'motd') {
        const text = parts.slice(2).join(' ');
        setSecurity((s) => ({ ...s, banner: text }));
        setObjectives((o) => ({ ...o, banner: true }));
        respond('MOTD banner set.');
      } else if (cmd === 'ip' && parts[1]?.toLowerCase() === 'default-gateway' && parts[2]) {
        setSecurity((s) => ({ ...s, defaultGateway: parts[2] }));
        setObjectives((o) => ({ ...o, gateway: true }));
        respond(`Default gateway set to ${parts[2]}`);
      } else if (cmd === 'ip' && parts[1]?.toLowerCase() === 'domain-name' && parts[2]) {
        setSecurity((s) => ({ ...s, domain: parts[2] }));
        respond(`Domain name set to ${parts[2]}`);
      } else if (cmd === 'username' && parts[1] && parts[2]?.toLowerCase() === 'password' && parts[3]) {
        setSecurity((s) => ({ ...s, users: { ...s.users, [parts[1]]: parts[3] } }));
        respond(`User ${parts[1]} added.`);
      } else if (cmd === 'crypto' && parts[1]?.toLowerCase() === 'key' && parts[2]?.toLowerCase() === 'generate' && parts[3]?.toLowerCase() === 'rsa') {
        setSecurity((s) => ({ ...s, ssh: true }));
        respond(['% Generating 1024 bit RSA keys, keys will be non-exportable...', '[OK]']);
      } else if (cmd === 'interface' && parts[1]) {
        const ifName = parts.slice(1).join(' ');
        const key = normalizeIface(ifName);
        if (key && interfaces[key]) {
          setCurrentInterface(key);
          setMode('config-if');
        } else respond(`% Invalid interface name: ${ifName}`);
      } else if (cmd === 'line' && parts[1]) {
        const lineName = parts.slice(1).join(' ');
        const key = normalizeLine(lineName);
        if (key && lines[key]) {
          setCurrentLine(key);
          setMode('config-line');
        } else respond(`% Invalid line: ${lineName}`);
      } else if (cmd === 'do') {
        handleShow(parts.slice(1));
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'config-if') {
      if (cmd === 'end' || cmd === 'exit') {
        setMode(cmd === 'end' ? 'priv' : 'config');
        setCurrentInterface(null);
      } else if (cmd === 'ip' && parts[1]?.toLowerCase() === 'address' && parts[2] && parts[3]) {
        if (!currentInterface) return;
        updateInterface(currentInterface, { ip: parts[2], mask: parts[3] });
        if (currentInterface === 'vlan 1') setObjectives((o) => ({ ...o, vlan: true }));
        respond(`IP address ${parts[2]} ${parts[3]} set on ${interfaces[currentInterface].name}`);
      } else if (line.toLowerCase() === 'no shutdown' && currentInterface) {
        updateInterface(currentInterface, { shutdown: false, protocol: 'up' });
        respond(`${interfaces[currentInterface].name} is now administratively up.`);
      } else if (line.toLowerCase() === 'shutdown' && currentInterface) {
        updateInterface(currentInterface, { shutdown: true, protocol: 'down' });
        respond(`${interfaces[currentInterface].name} is now administratively down.`);
      } else if (cmd === 'switchport' && currentInterface === 'fastEthernet 0/1') {
        const sw = interfaces['fastEthernet 0/1'].switchport!;
        const rest = parts.slice(1).map((p) => p.toLowerCase());
        if (rest[0] === 'mode' && rest[1] === 'access') updateInterface('fastEthernet 0/1', { switchport: { ...sw, mode: 'access' } });
        else if (rest[0] === 'port-security') updateInterface('fastEthernet 0/1', { switchport: { ...sw, portSecurity: true } });
        else if (rest[0] === 'port-security' && rest[1] === 'maximum' && rest[2]) updateInterface('fastEthernet 0/1', { switchport: { ...sw, maximum: parseInt(rest[2], 10) } });
        else if (rest[0] === 'port-security' && rest[1] === 'mac-address' && rest[2] === 'sticky') updateInterface('fastEthernet 0/1', { switchport: { ...sw, sticky: true } });
        else if (rest[0] === 'port-security' && rest[1] === 'violation' && ['shutdown', 'restrict', 'protect'].includes(rest[2])) {
          updateInterface('fastEthernet 0/1', { switchport: { ...sw, violation: rest[2] as any } });
        } else {
          respond('% Invalid switchport command.');
          return;
        }
        setObjectives((o) => ({ ...o, portSecurity: true }));
        respond('Switchport configuration updated.');
      } else if (cmd === 'do') {
        handleShow(parts.slice(1));
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'config-line') {
      if (cmd === 'end' || cmd === 'exit') {
        setMode(cmd === 'end' ? 'priv' : 'config');
        setCurrentLine(null);
      } else if (cmd === 'password' && parts[1] && currentLine) {
        updateLine(currentLine, { password: parts[1] });
        respond('Password set.');
      } else if (line.toLowerCase() === 'login' && currentLine) {
        updateLine(currentLine, { login: true });
        respond('Login enabled.');
      } else if (line.toLowerCase() === 'login local' && currentLine) {
        updateLine(currentLine, { login: true, loginLocal: true });
        respond('Login local enabled.');
      } else if (cmd === 'transport' && parts[1]?.toLowerCase() === 'input' && currentLine) {
        const inputs = parts.slice(2).map((p) => p.toLowerCase());
        updateLine(currentLine, { transport: inputs });
        if (currentLine === 'vty 0 4' && inputs.includes('ssh') && security.ssh) setObjectives((o) => ({ ...o, vty: true }));
        respond(`Transport input set to: ${inputs.join(' ')}`);
      } else if (cmd === 'do') {
        handleShow(parts.slice(1));
      } else {
        respond('% Unknown command.');
      }
      return;
    }
  };

  const handleShow = (args: string[]) => {
    const sub = args.map((a) => a.toLowerCase());
    const cmd = sub.join(' ');

    if (cmd === 'running-config' || cmd === 'run') {
      respond(['Building configuration...', '', ...buildConfig(hostname, interfaces, lines, security)]);
    } else if (cmd === 'startup-config' || cmd === 'start') {
      if (!saved) respond('No startup-config saved yet. Use "write memory".');
      else respond(['Saved configuration...', '', ...buildConfig(saved.hostname, saved.interfaces, saved.lines, saved.security)]);
    } else if (cmd === 'ip interface brief' || cmd === 'ip int br') {
      const rows = ['Interface              IP-Address      OK?  Method  Status                Protocol'];
      for (const [_, iface] of Object.entries(interfaces)) {
        const status = iface.shutdown ? 'administratively down' : 'up';
        const ip = iface.ip.padEnd(15);
        rows.push(`${iface.name.padEnd(22)} ${ip} YES  manual  ${status.padEnd(22)} ${iface.protocol}`);
      }
      respond(rows);
    } else if (cmd === 'port-security') {
      const fa01 = interfaces['fastEthernet 0/1'];
      const ps = fa01.switchport;
      if (!ps) return;
      respond([
        `Interface: ${fa01.name}`,
        `Port Security: ${ps.portSecurity ? 'Enabled' : 'Disabled'}`,
        `Max MAC Addresses: ${ps.maximum}`,
        `Sticky: ${ps.sticky ? 'Yes' : 'No'}`,
        `Violation: ${ps.violation}`,
      ]);
    } else if (cmd === 'interfaces' || cmd === 'int') {
      for (const [_, iface] of Object.entries(interfaces)) {
        respond([`${iface.name} is ${iface.shutdown ? 'administratively down' : 'up'}, line protocol is ${iface.protocol}`, `  Internet address is ${iface.ip === 'unassigned' ? 'not set' : `${iface.ip} ${iface.mask}`}`]);
      }
    } else {
      respond('% Invalid show command.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute(input);
    setInput('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Switch IOS Terminal</h3>
          <Badge status="up">{mode.toUpperCase()}</Badge>
        </div>
        <div className="mb-3 h-96 overflow-y-auto rounded border border-slate-200 bg-black p-3 font-mono text-sm text-emerald-400 dark:border-net-700">
          {history.map((h, i) => (
            <div key={i} className="whitespace-pre-wrap break-words">{h}</div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{prompt()}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cisco-600 dark:border-net-700 dark:bg-net-900"
            spellCheck={false}
            autoFocus
          />
          <Button type="submit" size="sm">Enter</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <h3 className="mb-3 font-semibold">Objectives</h3>
          <ul className="space-y-2 text-sm">
            <Objective done={objectives.enable} label="Enter privileged EXEC" />
            <Objective done={objectives.hostname} label="Set hostname to SW1" />
            <Objective done={objectives.secret} label="Set enable secret" />
            <Objective done={objectives.banner} label="Set MOTD banner" />
            <Objective done={objectives.vlan} label="Configure Vlan1 SVI IP" />
            <Objective done={objectives.gateway} label="Set ip default-gateway" />
            <Objective done={objectives.vty} label="Enable SSH on VTY 0-4" />
            <Objective done={objectives.portSecurity} label="Enable port-security on fa0/1" />
            <Objective done={objectives.save} label="Save configuration" />
          </ul>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">Sample Workflow</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            enable · configure terminal · hostname SW1 · enable secret cisco · banner motd Authorized · ip default-gateway 192.168.1.1 · interface vlan 1 · ip address 192.168.1.2 255.255.255.0 · no shutdown · exit · ip domain-name lab.local · crypto key generate rsa · username admin password cisco · line vty 0 4 · login local · transport input ssh · exit · interface fa0/1 · switchport port-security · switchport port-security mac-address sticky · end · write memory
          </p>
        </Card>
      </div>
    </div>
  );
}

interface ConfigSnapshot {
  hostname: string;
  interfaces: Record<string, InterfaceConfig>;
  lines: Record<string, LineConfig>;
  security: Security;
}

function Objective({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
      <span className={done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>{label}</span>
    </li>
  );
}

function getCommands(mode: Mode): string[] {
  switch (mode) {
    case 'user':
      return ['enable'];
    case 'priv':
      return ['disable', 'configure terminal', 'show running-config', 'show startup-config', 'show ip interface brief', 'show interfaces', 'show port-security', 'write memory'];
    case 'config':
      return ['hostname <name>', 'enable secret <pass>', 'banner motd <text>', 'ip default-gateway <ip>', 'ip domain-name <name>', 'username <user> password <pass>', 'crypto key generate rsa', 'interface <name>', 'line <name>', 'end', 'exit', 'do <show command>'];
    case 'config-if':
      return ['ip address <ip> <mask>', 'no shutdown', 'shutdown', 'switchport port-security', 'switchport port-security maximum <n>', 'switchport port-security mac-address sticky', 'switchport port-security violation <mode>', 'end', 'exit', 'do <show command>'];
    case 'config-line':
      return ['password <pass>', 'login', 'login local', 'transport input ssh', 'transport input telnet ssh', 'end', 'exit', 'do <show command>'];
  }
}

function buildConfig(host: string, ifaces: Record<string, InterfaceConfig>, lines: Record<string, LineConfig>, sec: Security): string[] {
  const out: string[] = [];
  out.push(`hostname ${host}`);
  if (sec.enableSecret) out.push(`enable secret ${sec.enableSecret}`);
  if (sec.banner) out.push(`banner motd ${sec.banner}`);
  if (sec.domain) out.push(`ip domain-name ${sec.domain}`);
  if (sec.defaultGateway) out.push(`ip default-gateway ${sec.defaultGateway}`);
  Object.entries(sec.users).forEach(([u, p]) => out.push(`username ${u} password ${p}`));
  if (sec.ssh) out.push('crypto key generate rsa');
  out.push('!');
  for (const [_, line] of Object.entries(lines)) {
    out.push(`line ${_}`);
    if (line.password) out.push(` password ${line.password}`);
    if (line.loginLocal) out.push(' login local');
    else if (line.login) out.push(' login');
    if (line.transport.length) out.push(` transport input ${line.transport.join(' ')}`);
    out.push('!');
  }
  for (const [_, iface] of Object.entries(ifaces)) {
    out.push(`interface ${iface.name}`);
    if (iface.ip !== 'unassigned' && iface.mask) out.push(` ip address ${iface.ip} ${iface.mask}`);
    if (!iface.shutdown) out.push(' no shutdown');
    if (iface.switchport) {
      out.push(` switchport mode ${iface.switchport.mode}`);
      if (iface.switchport.portSecurity) {
        out.push(' switchport port-security');
        out.push(` switchport port-security maximum ${iface.switchport.maximum}`);
        if (iface.switchport.sticky) out.push(' switchport port-security mac-address sticky');
        out.push(` switchport port-security violation ${iface.switchport.violation}`);
      }
    }
    out.push('!');
  }
  return out;
}
