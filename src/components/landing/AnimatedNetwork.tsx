import { motion } from 'framer-motion';

const NODES = [
  { x: 20, y: 25 },
  { x: 50, y: 15 },
  { x: 80, y: 30 },
  { x: 35, y: 65 },
  { x: 65, y: 70 },
  { x: 50, y: 50 },
];

const LINKS = [
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 3], [1, 2], [3, 4],
];

export function AnimatedNetwork() {
  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {LINKS.map(([a, b], i) => (
        <motion.line
          key={`link-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#lineGrad)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 3, repeatType: 'reverse' }}
        />
      ))}

      {NODES.map((node, i) => (
        <motion.g key={`node-${i}`}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="1.5"
            fill="#0ea5e9"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 1, delay: i * 0.15, repeat: Infinity, repeatDelay: 4 }}
          />
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="3"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [1, 2, 2] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        </motion.g>
      ))}

      {LINKS.slice(0, 4).map(([a, b], i) => (
        <motion.circle key={`packet-${i}`} r="0.8" fill="#67e8f9">
          <animateMotion
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
            path={`M ${NODES[a].x} ${NODES[a].y} L ${NODES[b].x} ${NODES[b].y}`}
          />
        </motion.circle>
      ))}
    </svg>
  );
}
