import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, User, Globe, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SEO } from '../landing/SEO';
import { LandingHeader } from '../landing/LandingHeader';

const EMAIL = 'erickomari243@gmail.com';

export function ContactPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [imgError, setImgError] = useState(false);

  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    setSent(true);
  };

  return (
    <>
      <SEO
        title="Contact Eric Omari"
        description="Get in touch with Eric Omari, the creator of the CCNA Zero-to-Hero 3D Lab Platform. Send a message for questions, feedback, or partnerships."
      />

      <LandingHeader />

      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cisco-950 py-28 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cisco-300">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact</h1>
            <p className="mt-3 text-lg text-slate-300">
              Have a question, partnership idea, or just want to say hello? Reach out and we’ll get back to you.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-cisco-500/30 bg-slate-800">
                    {!imgError && (
                      <img
                        src="/Erick.jpg"
                        alt="Eric Omari - CCNA 3D Lab Platform creator"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    )}
                    {imgError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500">
                        <User className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">Eric Omari</h2>
                  <p className="text-cisco-400">Creator & Network Engineer</p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                    <a
                      href="https://www.technobiztrader.net/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cisco-500 hover:text-cisco-300"
                    >
                      <Globe className="h-4 w-4" /> Website
                    </a>
                    <a
                      href="https://www.linkedin.com/in/erickomari/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cisco-500 hover:text-cisco-300"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                    <a
                      href="https://x.com/eomari"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cisco-500 hover:text-cisco-300"
                    >
                      <Twitter className="h-4 w-4" /> X
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full">
                <h3 className="mb-4 text-xl font-semibold">Send a message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Subject</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can I help?"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cisco-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">Message</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={5}
                      placeholder="Write your message here..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cisco-500"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={sent}>
                    <Send className="h-4 w-4" /> {sent ? 'Opening your email client...' : 'Send message'}
                  </Button>
                  {sent && (
                    <p className="mt-2 text-sm text-cisco-300">
                      Your email app should now open with the message ready to send.
                    </p>
                  )}
                </form>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-slate-300">
              Ready to start learning? Launch the lab and begin your CCNA journey.
            </p>
            <Link to="/app" className="mt-4 inline-block">
              <Button>Launch the App</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
