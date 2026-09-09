import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { labList } from '../../data/labs';
import { useProgress } from '../../stores/progress';
import { useLabRuntime } from '../../hooks/useLabRuntime';
import { LabScene } from '../three/LabScene.tsx';
import { DeviceInspector } from '../DeviceInspector';
import { LabControls } from '../LabControls';
import { SwitchingControls } from '../SwitchingControls.tsx';
import { IPv4Controls } from '../IPv4Controls';
import { VlanControls } from '../VlanControls';
import { InterVlanControls } from '../InterVlanControls';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const lazyComponent = <T extends Record<string, any>>(importFn: () => Promise<T>, name: keyof T) =>
  lazy(async () => {
    const mod = await importFn();
    return { default: mod[name as string] as any };
  });

const OsiFlowView = lazyComponent(() => import('../OsiFlowView'), 'OsiFlowView');
const SubnettingLab = lazyComponent(() => import('../SubnettingLab'), 'SubnettingLab');
const IPv6Lab = lazyComponent(() => import('../IPv6Lab'), 'IPv6Lab');
const StpLab = lazyComponent(() => import('../StpLab'), 'StpLab');
const EtherChannelLab = lazyComponent(() => import('../EtherChannelLab'), 'EtherChannelLab');
const RoutingLab = lazyComponent(() => import('../RoutingLab'), 'RoutingLab');
const StaticRoutingLab = lazyComponent(() => import('../StaticRoutingLab'), 'StaticRoutingLab');
const OspfLab = lazyComponent(() => import('../OspfLab'), 'OspfLab');
const DhcpLab = lazyComponent(() => import('../DhcpLab'), 'DhcpLab');
const DnsLab = lazyComponent(() => import('../DnsLab'), 'DnsLab');
const NatLab = lazyComponent(() => import('../NatLab'), 'NatLab');
const AclLab = lazyComponent(() => import('../AclLab'), 'AclLab');
const WirelessLab = lazyComponent(() => import('../WirelessLab'), 'WirelessLab');
const SecurityLab = lazyComponent(() => import('../SecurityLab'), 'SecurityLab');
const AutomationLab = lazyComponent(() => import('../AutomationLab'), 'AutomationLab');
const WiresharkLab = lazyComponent(() => import('../WiresharkLab'), 'WiresharkLab');
const TroubleshootingLab = lazyComponent(() => import('../TroubleshootingLab'), 'TroubleshootingLab');
const CapstoneLab = lazyComponent(() => import('../CapstoneLab'), 'CapstoneLab');
const ExamPrepLab = lazyComponent(() => import('../ExamPrepLab'), 'ExamPrepLab');
const PortfolioLab = lazyComponent(() => import('../PortfolioLab'), 'PortfolioLab');
const CareerLab = lazyComponent(() => import('../CareerLab'), 'CareerLab');
const CiscoIosLab = lazyComponent(() => import('../CiscoIosLab'), 'CiscoIosLab');
const SwitchConfigLab = lazyComponent(() => import('../SwitchConfigLab'), 'SwitchConfigLab');

export function LabView() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const lab = labList.find((l) => l.id === labId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const note = useProgress((s) => (lab ? s.notes[lab.id] ?? '' : ''));
  const isDone = useProgress((s) => (lab ? s.isCompleted(lab.id) : false));
  const setNote = useProgress((s) => s.setNote);
  const completeLab = useProgress((s) => s.completeLab);

  const runtime = useLabRuntime(lab ?? { id: '', phaseId: '', title: '', summary: '', objectives: [], devices: [], cables: [] });

  if (!lab) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h2 className="mb-2 text-2xl font-bold">Lab not found</h2>
        <p className="mb-6 text-slate-500 dark:text-slate-400">The lab you are looking for does not exist.</p>
        <Button onClick={() => navigate('/app')}>Back to dashboard</Button>
      </div>
    );
  }

  const isInteractive = lab.interactive ?? false;
  const isFlow = lab.view === 'flow';
  const isSubnet = lab.view === 'subnet';
  const isIPv6 = lab.view === 'ipv6';
  const isIOS = lab.view === 'ios';
  const isStp = lab.view === 'stp';
  const isEtherChannel = lab.view === 'etherchannel';
  const isRouting = lab.view === 'routing';
  const isStatic = lab.view === 'static';
  const isOspf = lab.view === 'ospf';
  const isDhcp = lab.view === 'dhcp';
  const isDns = lab.view === 'dns';
  const isNat = lab.view === 'nat';
  const isAcl = lab.view === 'acl';
  const isWireless = lab.view === 'wireless';
  const isSecurity = lab.view === 'security';
  const isAutomation = lab.view === 'automation';
  const isWireshark = lab.view === 'wireshark';
  const isTroubleshoot = lab.view === 'troubleshoot';
  const isCapstone = lab.view === 'capstone';
  const isExam = lab.view === 'examprep';
  const isPortfolio = lab.view === 'portfolio';
  const isCareer = lab.view === 'career';
  const isIPv4 = lab.id.startsWith('lab-ipv4');
  const devices = isInteractive ? runtime.devices : lab.devices;
  const cables = isInteractive ? runtime.cables : lab.cables;
  const selectedDevice = devices.find((d) => d.id === selectedId) ?? null;

  const renderControls = () => {
    if (!isInteractive) return null;
    if (lab.id === 'lab-ethernet-switching') return <SwitchingControls runtime={runtime} />;
    if (lab.id === 'lab-vlans') return <VlanControls runtime={runtime} />;
    if (lab.id === 'lab-inter-vlan-routing') return <InterVlanControls runtime={runtime} />;
    if (isIPv4) return <IPv4Controls runtime={runtime} />;
    return <LabControls runtime={runtime} selectedId={selectedId} />;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{lab.title}</h1>
        </div>
        <Button onClick={() => completeLab(lab.id)} disabled={isDone} variant={isDone ? 'secondary' : 'primary'}>
          {isDone ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Completed
            </>
          ) : (
            'Mark lab complete'
          )}
        </Button>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading lab...</div>}>
      {isFlow ? (
        <OsiFlowView />
      ) : isSubnet ? (
        <SubnettingLab />
      ) : isIPv6 ? (
        <IPv6Lab />
      ) : isStp ? (
        <StpLab />
      ) : isEtherChannel ? (
        <EtherChannelLab />
      ) : isRouting ? (
        <RoutingLab />
      ) : isStatic ? (
        <StaticRoutingLab />
      ) : isOspf ? (
        <OspfLab />
      ) : isDhcp ? (
        <DhcpLab />
      ) : isDns ? (
        <DnsLab />
      ) : isNat ? (
        <NatLab />
      ) : isAcl ? (
        <AclLab />
      ) : isWireless ? (
        <WirelessLab />
      ) : isSecurity ? (
        <SecurityLab />
      ) : isAutomation ? (
        <AutomationLab />
      ) : isWireshark ? (
        <WiresharkLab />
      ) : isTroubleshoot ? (
        <TroubleshootingLab />
      ) : isCapstone ? (
        <CapstoneLab />
      ) : isExam ? (
        <ExamPrepLab />
      ) : isPortfolio ? (
        <PortfolioLab />
      ) : isCareer ? (
        <CareerLab />
      ) : isIOS ? (
        lab.id === 'lab-switch-config' ? <SwitchConfigLab /> : <CiscoIosLab />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative h-[50vh] overflow-hidden rounded-xl border border-slate-200 dark:border-net-700 lg:col-span-2 lg:h-[720px]">
            <Canvas camera={{ position: [6, 5, 8], fov: 45 }} style={{ background: '#0b1221' }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-5, 5, -5]} intensity={0.5} />
              <OrbitControls target={[0, 1.5, 0]} enablePan enableZoom enableRotate />
              <LabScene
                devices={devices}
                cables={cables}
                selectedDeviceId={selectedId}
                onSelect={setSelectedId}
                frames={isInteractive ? runtime.frames : []}
              />
            </Canvas>
            <div className="absolute bottom-3 left-3 text-xs text-slate-400">
              Drag to orbit • Scroll to zoom • Click a device to inspect
            </div>
          </div>

          <div className="space-y-4 lg:col-span-1">
            <Card>
              <h3 className="mb-3 font-semibold">Objectives</h3>
              <ul className="space-y-2">
                {lab.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cisco-500" />
                    {obj}
                  </li>
                ))}
                {lab.tasks?.map((task) => (
                  <li key={task.id} className="flex items-start gap-2 text-sm text-cisco-600 dark:text-cisco-400">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cisco-500" />
                    {task.description}
                  </li>
                ))}
              </ul>
            </Card>

            {renderControls()}

            <Card>
              <h3 className="mb-3 font-semibold">Device Inspector</h3>
              <DeviceInspector
                device={selectedDevice}
                onToggleInterface={isInteractive ? runtime.toggleInterface : undefined}
              />
            </Card>

            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Notes</h3>
                {isDone && <Badge status="up">Complete</Badge>}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(lab.id, e.target.value)}
                placeholder="Record your observations, commands, and troubleshooting steps..."
                className="h-32 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-cisco-600 dark:border-net-700 dark:bg-net-900"
              />
            </Card>
          </div>
        </div>
      )}
      </Suspense>
    </div>
  );
}
