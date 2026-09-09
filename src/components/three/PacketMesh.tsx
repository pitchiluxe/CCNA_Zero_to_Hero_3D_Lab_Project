import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Device } from '../../types';
import { getDeviceCenter } from './DeviceMesh';

interface Props {
  from: Device;
  to: Device;
  start: number;
  srcMac?: string;
  dstMac?: string;
}

export function PacketMesh({ from, to, start, srcMac, dstMac }: Props) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const progress = Math.min((performance.now() - start) / 2000, 1);
    const startVec = getDeviceCenter(from);
    const endVec = getDeviceCenter(to);
    ref.current.position.lerpVectors(startVec, endVec, progress);
  });

  const label = srcMac && dstMac ? `${srcMac} → ${dstMac}` : srcMac ?? 'Packet';

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#0ac2ff" emissive="#0ac2ff" emissiveIntensity={0.6} />
      </mesh>
      <Html position={[0, 0.35, 0]} center distanceFactor={10}>
        <div className="whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white shadow">
          {label}
        </div>
      </Html>
    </group>
  );
}
