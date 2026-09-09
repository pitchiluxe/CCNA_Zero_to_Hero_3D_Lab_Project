import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Device, DeviceType } from '../../types';

interface Spec {
  size: [number, number, number];
  geometry: JSX.Element;
  labelOffset: number;
}

const SPECS: Record<DeviceType, Spec> = {
  rack: {
    size: [1.4, 2.2, 0.8],
    geometry: <boxGeometry args={[1.4, 2.2, 0.8]} />,
    labelOffset: 1.2,
  },
  router: {
    size: [0.9, 0.22, 0.6],
    geometry: <boxGeometry args={[0.9, 0.22, 0.6]} />,
    labelOffset: 0.15,
  },
  switch: {
    size: [0.9, 0.18, 0.6],
    geometry: <boxGeometry args={[0.9, 0.18, 0.6]} />,
    labelOffset: 0.12,
  },
  pc: {
    size: [0.5, 0.4, 0.5],
    geometry: <boxGeometry args={[0.5, 0.4, 0.5]} />,
    labelOffset: 0.28,
  },
  server: {
    size: [0.8, 0.35, 0.7],
    geometry: <boxGeometry args={[0.8, 0.35, 0.7]} />,
    labelOffset: 0.22,
  },
  ap: {
    size: [0.35, 0.12, 0.35],
    geometry: <cylinderGeometry args={[0.2, 0.2, 0.12, 32]} />,
    labelOffset: 0.2,
  },
};

export function getDeviceCenter(device: Device) {
  const spec = SPECS[device.type];
  return new THREE.Vector3(
    device.x,
    device.y + spec.size[1] / 2,
    device.z
  );
}

interface DeviceMeshProps {
  device: Device;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function DeviceMesh({ device, selected, onSelect }: DeviceMeshProps) {
  const spec = useMemo(() => SPECS[device.type], [device.type]);

  return (
    <group
      position={[device.x, device.y + spec.size[1] / 2, device.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(device.id);
      }}
    >
      <mesh castShadow receiveShadow>
        {spec.geometry}
        <meshStandardMaterial
          color={device.color ?? '#64748b'}
          emissive={selected ? '#ffffff' : '#000000'}
          emissiveIntensity={selected ? 0.25 : 0}
        />
      </mesh>
      <Html position={[0, spec.size[1] / 2 + spec.labelOffset, 0]} center distanceFactor={10}>
        <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs font-medium text-white shadow backdrop-blur-sm">
          {device.name}
        </div>
      </Html>
    </group>
  );
}
