import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Layer {
  name: string;
  pdu: string;
  protocols: string;
  action: string;
  decap: string;
}

const LAYERS: Layer[] = [
  { name: 'Application', pdu: 'Data', protocols: 'HTTP, FTP, DNS, SMTP', action: 'Data is created', decap: 'Data is delivered' },
  { name: 'Transport', pdu: 'Segment', protocols: 'TCP, UDP', action: 'Add transport header', decap: 'Remove transport header' },
  { name: 'Network', pdu: 'Packet', protocols: 'IP, ICMP', action: 'Add IP header', decap: 'Remove IP header' },
  { name: 'Data Link', pdu: 'Frame', protocols: 'Ethernet, PPP', action: 'Add MAC header/trailer', decap: 'Remove MAC header/trailer' },
  { name: 'Physical', pdu: 'Bits', protocols: 'Copper, fiber, wireless', action: 'Transmit bits', decap: 'Receive bits' },
];

const STAGE_COUNT = 10;
const STEP_MS = 700;

function getFailureStage(failure: string | null) {
  return LAYERS.findIndex((l) => l.name === failure);
}

function getStageInfo(stage: number) {
  const sideA = stage <= 4;
  const layerIndex = sideA ? stage : 9 - stage;
  const layer = LAYERS[layerIndex] ?? LAYERS[0];
  const action = sideA ? layer.action : layer.decap;
  const host = sideA ? 'Host A' : 'Host B';
  const label = stage === 0 ? 'Data ready' : stage === STAGE_COUNT - 1 ? 'Delivered' : `${action} on ${host}`;
  return { layer, layerIndex, sideA, pdu: layer.pdu, label };
}

function getPacketPosition(stage: number) {
  const x = stage <= 4 ? 20 : 80;
  const layerIndex = stage <= 4 ? stage : 9 - stage;
  const y = 5 + Math.max(0, layerIndex) * 18; // percent
  return { x, y };
}

export function OsiFlowView() {
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [injectedFailure, setInjectedFailure] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const failureStage = useMemo(() => getFailureStage(injectedFailure), [injectedFailure]);
  const stageInfo = getStageInfo(stage);
  const pos = getPacketPosition(stage);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setStage((prev) => {
        if (prev >= STAGE_COUNT - 1) {
          setRunning(false);
          return prev;
        }
        const next = prev + 1;
        const nextLayerIndex = next <= 4 ? next : 9 - next;
        if (injectedFailure && nextLayerIndex === failureStage) {
          setRunning(false);
        }
        return next;
      });
    }, STEP_MS);
    return () => clearInterval(id);
  }, [running, injectedFailure, failureStage]);

  const startNormal = () => {
    setInjectedFailure(null);
    setStage(0);
    setRunning(true);
    setResult(null);
    setDiagnosis('');
  };

  const startChallenge = () => {
    const randomLayer = LAYERS[Math.floor(Math.random() * LAYERS.length)].name;
    setInjectedFailure(randomLayer);
    setStage(0);
    setRunning(true);
    setResult(null);
    setDiagnosis('');
  };

  const reset = () => {
    setStage(0);
    setRunning(false);
    setInjectedFailure(null);
    setResult(null);
    setDiagnosis('');
  };

  const checkDiagnosis = () => {
    if (diagnosis === injectedFailure) {
      setResult('correct');
    } else {
      setResult('wrong');
    }
  };

  const failed = !running && stage > 0 && stage < STAGE_COUNT - 1 && injectedFailure && stageInfo.layerIndex === failureStage;
  const finished = !running && stage === STAGE_COUNT - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">OSI / TCP-IP Packet Flow</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={startNormal}>
            <Play className="mr-1 h-4 w-4" /> Start journey
          </Button>
          <Button size="sm" variant="secondary" onClick={startChallenge}>
            New challenge
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <Card className="relative h-[460px] overflow-hidden">
        <div className="grid h-full grid-cols-2 gap-8 px-4 py-2">
          <div className="space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-cisco-500">Host A — Encapsulation</p>
            {LAYERS.map((l, i) => (
              <StageBox key={l.name} layer={l} active={stageInfo.layerIndex === i && stageInfo.sideA} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-cisco-500">Host B — Decapsulation</p>
            {LAYERS.map((l, i) => (
              <StageBox key={l.name} layer={l} active={stageInfo.layerIndex === i && !stageInfo.sideA} />
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cisco-500 shadow-[0_0_15px_rgba(10,194,255,0.6)] transition-all duration-500"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-[10px] font-bold text-white">{stageInfo.pdu}</span>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current step</p>
            <p className="text-lg font-semibold">{stageInfo.label}</p>
          </div>
          {failed && (
            <Badge status="error">
              <AlertTriangle className="mr-1 h-3 w-3" /> Failure detected
            </Badge>
          )}
          {finished && (
            <Badge status="up">
              <CheckCircle className="mr-1 h-3 w-3" /> Delivered
            </Badge>
          )}
        </div>
      </Card>

      {failed && (
        <Card>
          <h3 className="mb-2 font-semibold">Diagnose the failure</h3>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">The packet stopped at the <strong>{stageInfo.layer.name}</strong> stage. Which OSI layer caused the failure?</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
            >
              <option value="">Select layer...</option>
              {LAYERS.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <Button onClick={checkDiagnosis}>Check</Button>
          </div>
          {result === 'correct' && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">Correct! {stageInfo.layer.name} is responsible for {stageInfo.layer.action.toLowerCase()}.</p>
          )}
          {result === 'wrong' && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">Not quite. Look at where the packet stopped and which header was being added or removed.</p>
          )}
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-semibold">OSI Model Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-2">Layer</th>
                <th className="pb-2">PDU</th>
                <th className="pb-2">Example protocols</th>
                <th className="pb-2">Key device / function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-net-700">
              {LAYERS.map((l) => (
                <tr key={l.name}>
                  <td className="py-2 font-medium">{l.name}</td>
                  <td className="py-2">{l.pdu}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">{l.protocols}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">
                    {l.name === 'Application' && 'End-user application'}
                    {l.name === 'Transport' && 'Transport protocol, port numbers'}
                    {l.name === 'Network' && 'Router, IP routing'}
                    {l.name === 'Data Link' && 'Switch, MAC addresses'}
                    {l.name === 'Physical' && 'Hub, cable, NIC'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StageBox({ layer, active }: { layer: Layer; active: boolean }) {
  return (
    <div
      className={`rounded-lg border p-2 text-center text-sm transition-colors ${
        active
          ? 'border-cisco-500 bg-cisco-50 dark:bg-cisco-900/20'
          : 'border-slate-200 dark:border-net-700'
      }`}
    >
      <p className="font-semibold">{layer.name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">PDU: {layer.pdu}</p>
    </div>
  );
}
