import * as THREE from 'three';
import { Device, Cable } from '../../types';
import { DeviceMesh, getDeviceCenter } from './DeviceMesh';
import { CableLine } from './CableLine';
import { PacketMesh } from './PacketMesh';

interface Props {
  devices: Device[];
  cables: Cable[];
  selectedDeviceId: string | null;
  onSelect: (id: string) => void;
  frames?: { id: string; from: string; to: string; start: number; srcMac?: string; dstMac?: string }[];
}

export function LabScene({ devices, cables, selectedDeviceId, onSelect, frames = [] }: Props) {
  const deviceById = Object.fromEntries(devices.map((d) => [d.id, d]));

  const target = new THREE.Vector3(0, 1.5, 0);
  if (devices.length > 0) {
    const centers = devices.map((d) => getDeviceCenter(d));
    target.set(
      centers.reduce((a, b) => a + b.x, 0) / centers.length,
      centers.reduce((a, b) => a + b.y, 0) / centers.length,
      centers.reduce((a, b) => a + b.z, 0) / centers.length
    );
  }

  return (
    <>
      <color attach="background" args={['#0b1221']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 12, 8]} intensity={1.2} castShadow />
      <pointLight position={[-6, 4, -4]} intensity={0.6} color="#0ac2ff" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <gridHelper args={[18, 18, '#1e293b', '#1e293b']} />

      {devices.map((device) => (
        <DeviceMesh
          key={device.id}
          device={device}
          selected={selectedDeviceId === device.id}
          onSelect={onSelect}
        />
      ))}

      {cables.map((cable) => (
        <CableLine key={cable.id} cable={cable} devices={devices} />
      ))}

      {frames.map((frame) => {
        const fromDevice = deviceById[frame.from];
        const toDevice = deviceById[frame.to];
        if (!fromDevice || !toDevice) return null;
        return (
          <PacketMesh
            key={frame.id}
            from={fromDevice}
            to={toDevice}
            start={frame.start}
            srcMac={frame.srcMac}
            dstMac={frame.dstMac}
          />
        );
      })}
    </>
  );
}
