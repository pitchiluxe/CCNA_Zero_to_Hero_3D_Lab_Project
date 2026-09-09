import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

const EXAMPLE = `{
  "device": "switch-01",
  "interfaces": [
    { "name": "g0/1", "vlan": 10, "mode": "access" },
    { "name": "g0/2", "vlan": 20, "mode": "access" }
  ]
}`;

export function AutomationLab() {
  const [input, setInput] = useState(EXAMPLE);
  const [result, setResult] = useState<{ ok: boolean; message: string; data?: any } | null>(null);

  const run = () => {
    try {
      const data = JSON.parse(input);
      if (!data.device || !Array.isArray(data.interfaces)) {
        throw new Error('Invalid schema: must have device and interfaces array.');
      }
      setResult({ ok: true, message: `Parsed ${data.interfaces.length} interfaces for ${data.device}.`, data });
    } catch (e: any) {
      setResult({ ok: false, message: e.message });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Network Automation Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Parse JSON/YAML-like device data and understand how automation templates work.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Device Data (JSON)</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full rounded border border-slate-200 bg-slate-50 p-2 font-mono text-sm dark:border-net-700 dark:bg-net-900"
          />
          <Button onClick={run} className="mt-3">Parse</Button>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Result</h3>
            {result ? (
              <>
                <Badge status={result.ok ? 'up' : 'down'}>{result.ok ? 'Valid' : 'Invalid'}</Badge>
                <p className="mt-2 text-sm text-cisco-600 dark:text-cisco-400">{result.message}</p>
                {result.data && <pre className="mt-2 max-h-60 overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-net-900">{JSON.stringify(result.data, null, 2)}</pre>}
              </>
            ) : (
              <p className="text-sm text-slate-500">Click Parse to validate the JSON.</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold">Key Concepts</h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>JSON/YAML:</strong> data formats for API payloads and playbooks.</li>
              <li><strong>REST API:</strong> HTTP methods to query and configure devices.</li>
              <li><strong>Netmiko / NAPALM:</strong> Python libraries for device interaction.</li>
              <li><strong>Templating:</strong> generate configs from structured data.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
