import { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LabScene } from '../three/LabScene';
import { labs } from '../../data/labs';

const ROOM = labs['lab-room'];

export function LabPreview() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const now = useMemo(() => performance.now() + tick * 0, [tick]);

  const frames = useMemo(
    () => [
      { id: 'p1', from: 'router1', to: 'switch1', start: now },
      { id: 'p2', from: 'switch1', to: 'pc1', start: now + 600 },
      { id: 'p3', from: 'switch1', to: 'server1', start: now + 1200 },
    ],
    [now]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas camera={{ position: [6, 5, 8], fov: 45 }}>
        <color attach="background" args={['#0b1221']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        <OrbitControls
          target={[0, 1.5, 0]}
          enablePan={false}
          enableZoom={false}
          enableRotate
          autoRotate
          autoRotateSpeed={0.8}
        />
        <LabScene
          devices={ROOM.devices}
          cables={ROOM.cables}
          selectedDeviceId={null}
          onSelect={() => {}}
          frames={frames}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-slate-400">
        Drag to orbit • Auto-rotating preview
      </div>
    </div>
  );
}
