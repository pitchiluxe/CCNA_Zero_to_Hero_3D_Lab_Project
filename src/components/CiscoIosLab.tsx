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
}

type Mode = 'user' | 'priv' | 'config' | 'config-if';

interface ConfigSnapshot {
  hostname: string;
  interfaces: Record<string, InterfaceConfig>;
}

export function CiscoIosLab() {
  const [hostname, setHostname] = useState('Router');
  const [mode, setMode] = useState<Mode>('user');
  const [currentInterface, setCurrentInterface] = useState<string | null>(null);
  const [interfaces, setInterfaces] = useState<Record<string, InterfaceConfig>>({
    'gigabitEthernet 0/0': { name: 'GigabitEthernet0/0', ip: 'unassigned', mask: '', shutdown: true, protocol: 'down' },
    'gigabitEthernet 0/1': { name: 'GigabitEthernet0/1', ip: 'unassigned', mask: '', shutdown: true, protocol: 'down' },
    'vlan 1': { name: 'Vlan1', ip: 'unassigned', mask: '', shutdown: true, protocol: 'down' },
  });
  const [saved, setSaved] = useState<ConfigSnapshot | null>(null);

  const [history, setHistory] = useState<string[]>([
    "Cisco IOS Simulator",
    "Type '?' for a list of available commands.",
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [objectives, setObjectives] = useState({
    enable: false,
    hostname: false,
    interface: false,
    ip: false,
    noShutdown: false,
    save: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const stateSnapshot = () => ({ hostname, interfaces });

  const prompt = () => {
    const base = hostname;
    switch (mode) {
      case 'user':
        return `${base}>`;
      case 'priv':
        return `${base}#`;
      case 'config':
        return `${base}(config)#`;
      case 'config-if':
        return `${base}(config-if)#`;
    }
  };

  const normalizeIface = (name: string) => {
    const n = name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (/^g(igabit)?e?(thernet)?\s*0\/0$/.test(n)) return 'gigabitEthernet 0/0';
    if (/^g(igabit)?e?(thernet)?\s*0\/1$/.test(n)) return 'gigabitEthernet 0/1';
    if (/^vlan\s*1$/.test(n)) return 'vlan 1';
    return null;
  };

  const updateInterface = (name: string, update: Partial<InterfaceConfig>) => {
    setInterfaces((prev) => ({
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

    const respond = (msg: string | string[]) => {
      setHistory((prev) => [...prev, ...(Array.isArray(msg) ? msg : [msg])]);
    };

    if (line === '?') {
      respond(['Available commands:', ...getCommands(mode)]);
      return;
    }

    if (mode === 'user') {
      if (cmd === 'enable') {
        setMode('priv');
        setObjectives((o) => ({ ...o, enable: true }));
      } else if (cmd === 'show') {
        respond('% Invalid input; limited commands in user EXEC. Try "enable".');
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'priv') {
      if (cmd === 'disable') {
        setMode('user');
      } else if (cmd === 'configure' || (cmd === 'conf' && parts[1]?.toLowerCase() === 't')) {
        if (line.toLowerCase().startsWith('configure terminal') || line.toLowerCase().startsWith('conf t')) {
          setMode('config');
        } else {
          respond('% Incomplete command.');
        }
      } else if (cmd === 'show') {
        handleShow(parts.slice(1), respond);
      } else if (cmd === 'write' || (cmd === 'copy' && parts[1]?.toLowerCase() === 'running-config' && parts[2]?.toLowerCase() === 'startup-config')) {
        setSaved(stateSnapshot());
        setObjectives((o) => ({ ...o, save: true }));
        respond('[OK] Configuration saved to NVRAM.');
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'config') {
      if (cmd === 'end') {
        setMode('priv');
        setCurrentInterface(null);
      } else if (cmd === 'exit') {
        setMode('priv');
        setCurrentInterface(null);
      } else if (cmd === 'hostname' && parts[1]) {
        setHostname(parts[1]);
        setObjectives((o) => ({ ...o, hostname: true }));
        respond(`Hostname set to ${parts[1]}`);
      } else if (cmd === 'interface' && parts[1]) {
        const ifName = parts.slice(1).join(' ');
        const key = normalizeIface(ifName);
        if (key && interfaces[key]) {
          setCurrentInterface(key);
          setObjectives((o) => ({ ...o, interface: true }));
          setMode('config-if');
        } else {
          respond(`% Invalid interface name: ${ifName}`);
        }
      } else if (cmd === 'do') {
        handleShow(parts.slice(1), respond);
      } else {
        respond('% Unknown command.');
      }
      return;
    }

    if (mode === 'config-if') {
      if (cmd === 'end') {
        setMode('priv');
        setCurrentInterface(null);
      } else if (cmd === 'exit') {
        setMode('config');
        setCurrentInterface(null);
      } else if (cmd === 'ip' && parts[1] === 'address' && parts[2] && parts[3]) {
        if (!currentInterface) return;
        updateInterface(currentInterface, { ip: parts[2], mask: parts[3] });
        setObjectives((o) => ({ ...o, ip: true }));
        respond(`IP address ${parts[2]} ${parts[3]} set on ${interfaces[currentInterface].name}`);
      } else if (line.toLowerCase() === 'no shutdown' && currentInterface) {
        updateInterface(currentInterface, { shutdown: false, protocol: 'up' });
        setObjectives((o) => ({ ...o, noShutdown: true }));
        respond(`${interfaces[currentInterface].name} is now administratively up.`);
      } else if (line.toLowerCase() === 'shutdown' && currentInterface) {
        updateInterface(currentInterface, { shutdown: true, protocol: 'down' });
        respond(`${interfaces[currentInterface].name} is now administratively down.`);
      } else if (cmd === 'do') {
        handleShow(parts.slice(1), respond);
      } else {
        respond('% Unknown command.');
      }
      return;
    }
  };

  const handleShow = (args: string[], respond: (msg: string | string[]) => void) => {
    const sub = args.map((a) => a.toLowerCase());
    const cmd = sub.join(' ');

    if (cmd === 'running-config' || cmd === 'run') {
      respond(['Building configuration...', '', ...buildConfig(hostname, interfaces)]);
    } else if (cmd === 'startup-config' || cmd === 'start') {
      if (!saved) {
        respond('No startup-config saved yet. Use "write memory" or "copy running-config startup-config".');
      } else {
        respond(['Saved configuration...', '', ...buildConfig(saved.hostname, saved.interfaces)]);
      }
    } else if (cmd === 'ip interface brief' || cmd === 'ip int br') {
      const rows = ['Interface              IP-Address      OK?  Method  Status                Protocol'];
      for (const [key, iface] of Object.entries(interfaces)) {
        const status = iface.shutdown ? 'administratively down' : 'up';
        const protocol = iface.protocol;
        const ip = iface.ip.padEnd(15);
        rows.push(`${iface.name.padEnd(22)} ${ip} YES  manual  ${status.padEnd(22)} ${protocol}`);
      }
      respond(rows);
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
          <h3 className="font-semibold">Cisco IOS Terminal</h3>
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
            <Objective done={objectives.hostname} label="Set hostname to R1" />
            <Objective done={objectives.interface} label="Enter interface g0/0 config" />
            <Objective done={objectives.ip} label="Assign IP 192.168.1.1 255.255.255.0" />
            <Objective done={objectives.noShutdown} label="Issue no shutdown" />
            <Objective done={objectives.save} label="Save with write memory" />
          </ul>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">Hint</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try: <code>enable</code>, <code>configure terminal</code>, <code>hostname R1</code>, <code>interface g0/0</code>, <code>ip address 192.168.1.1 255.255.255.0</code>, <code>no shutdown</code>, <code>end</code>, <code>write memory</code>, <code>show ip int br</code>.
          </p>
        </Card>
      </div>
    </div>
  );
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
      return ['disable', 'configure terminal', 'show running-config', 'show startup-config', 'show ip interface brief', 'show interfaces', 'write memory', 'copy running-config startup-config'];
    case 'config':
      return ['hostname <name>', 'interface <name>', 'end', 'exit', 'do <show command>', '?'];
    case 'config-if':
      return ['ip address <ip> <mask>', 'no shutdown', 'shutdown', 'end', 'exit', 'do <show command>'];
  }
}

function buildConfig(host: string, ifaces: Record<string, InterfaceConfig>): string[] {
  const out: string[] = [`hostname ${host}`, '!'];
  for (const [_, iface] of Object.entries(ifaces)) {
    out.push(`interface ${iface.name}`);
    if (iface.ip !== 'unassigned' && iface.mask) {
      out.push(` ip address ${iface.ip} ${iface.mask}`);
    }
    if (!iface.shutdown) {
      out.push(' no shutdown');
    }
    out.push('!');
  }
  return out;
}
