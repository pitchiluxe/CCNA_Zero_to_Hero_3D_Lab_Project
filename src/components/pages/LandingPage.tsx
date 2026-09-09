import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { AnimatedNetwork } from '../landing/AnimatedNetwork';
import { Features } from '../landing/Features';
import { HowItWorks } from '../landing/HowItWorks';
import { SEO } from '../landing/SEO';
import { LandingHeader } from '../landing/LandingHeader';
import { LabPreview } from '../landing/LabPreview';

export function LandingPage() {
  return (
    <>
      <SEO
        title="CCNA Zero-to-Hero 3D Lab Platform"
        description="Master CCNA networking through interactive 3D labs, Cisco IOS simulation, subnetting drills, OSPF, VLANs, ACLs, and packet analysis. Built by Eric Omari."
      />

      <LandingHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cisco-950 pb-24 pt-28 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <AnimatedNetwork />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center rounded-full border border-cisco-500/40 bg-cisco-500/10 px-3 py-1 text-xs font-medium text-cisco-300 backdrop-blur-sm">
                The CCNA training lab built for visual learners
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Build Real Networking Skills in a{' '}
              <span className="bg-gradient-to-r from-cisco-300 to-cyan-400 bg-clip-text text-transparent">
                3D Lab
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              From subnetting to OSPF, from Cisco IOS to Wireshark. Interactive, browser-based CCNA labs with live 3D topologies and guided objectives.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link to="/app">
                <Button size="lg" className="px-8 text-lg shadow-lg shadow-cisco-500/30">
                  Launch the Lab
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="px-8 text-lg">
                  Contact
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-sm sm:p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <LabPreview />
            </div>
          </motion.div>
        </div>
      </section>

      <Features />
      <HowItWorks />

      <section className="bg-slate-950 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-4">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ready to start your CCNA journey?
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-slate-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            No Packet Tracer or GNS3 setup required. Everything runs in your browser.
          </motion.p>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/app">
              <Button size="lg" className="px-8 text-lg shadow-lg shadow-cisco-500/30">
                Enter the Lab
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} CCNA Zero-to-Hero 3D Lab Platform. Built by Eric Omari.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link to="/" className="hover:text-cisco-400">Home</Link>
          <Link to="/app" className="hover:text-cisco-400">App</Link>
          <Link to="/contact" className="hover:text-cisco-400">Contact</Link>
        </div>
      </footer>
    </>
  );
}
