import { motion } from 'framer-motion';
import { Layers, Network, Server, Shield, Globe, BookOpen } from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'OSI/TCP-IP Visualized',
    description: 'Watch encapsulation and decapsulation happen layer by layer with animated PDUs.',
  },
  {
    icon: Network,
    title: 'Live 3D Topologies',
    description: 'Orbit around racks, routers, switches, and servers. Click any device to inspect interfaces and status.',
  },
  {
    icon: Server,
    title: 'Cisco IOS Simulator',
    description: 'Practice EXEC modes, hostnames, IP addressing, and verification commands in a safe browser CLI.',
  },
  {
    icon: Shield,
    title: 'Subnetting & Routing',
    description: 'Master CIDR, VLSM, static routes, OSPF, EIGRP, and longest-prefix matching.',
  },
  {
    icon: Globe,
    title: 'Services & Security',
    description: 'Configure DHCP, DNS, NAT, ACLs, VLANs, port security, and SSH with guided labs.',
  },
  {
    icon: BookOpen,
    title: 'Exam Prep & Career Mode',
    description: 'Review CCNA questions, generate a GitHub portfolio, and track role readiness.',
  },
];

export function Features() {
  return (
    <section className="bg-slate-900 py-20" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Why learn here?</h2>
          <p className="mt-3 text-slate-400">Hands-on labs designed to mirror real networking tasks.</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm transition-colors hover:border-cisco-500/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cisco-500/20 text-cisco-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
