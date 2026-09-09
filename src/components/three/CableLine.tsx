import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Cable, Device } from '../../types';
import { getDeviceCenter } from './DeviceMesh';

interface Props {
  cable: Cable;
  devices: Device[];
}

export function CableLine({ cable, devices }: Props) {
  const from = devices.find((d) => d.id === cable.from);
  const to = devices.find((d) => d.id === cable.to);
  if (!from || !to) return null;

  const points = [getDeviceCenter(from), getDeviceCenter(to)];
  const color = cable.status === 'up' ? '#22c55e' : '#f43f5e';

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
    />
  );
}
