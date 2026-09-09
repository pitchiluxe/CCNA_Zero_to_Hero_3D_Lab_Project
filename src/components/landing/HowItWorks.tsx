import { motion } from 'framer-motion';

const STEPS = [
  { number: '01', title: 'Choose a phase', description: 'Start at the foundation or jump into a topic like OSPF, VLANs, or Security.' },
  { number: '02', title: 'Enter the lab', description: 'Interact with 3D topologies, CLI simulators, and live packet flows.' },
  { number: '03', title: 'Complete objectives', description: 'Hit every goal, record notes, and mark the lab complete to track progress.' },
];

export function HowItWorks() {
  return (
    <section className="bg-slate-950 py-20" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">How it works</h2>
          <p className="mt-3 text-slate-400">A structured path from beginner to CCNA-ready.</p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <span className="text-5xl font-black text-slate-800">{step.number}</span>
              <h3 className="-mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-slate-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
