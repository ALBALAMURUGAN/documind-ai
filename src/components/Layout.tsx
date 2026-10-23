import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const LINKS = [
  { to: '/', label: 'Atelier' },
  { to: '/workspace', label: 'Vault' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/studio', label: 'Citation Studio' },
  { to: '/trust', label: 'Trust' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-void text-ivory">
      <div className="grain" />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#07040e]/78 backdrop-blur-xl border-b border-gold/15' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" className="group flex items-center gap-3">
            <img src="/images/logo-mark.png" alt="" className="h-10 w-10 object-contain drop-shadow-[0_0_18px_rgba(212,175,55,0.35)]" />
            <div className="leading-none">
              <div className="font-display text-[1.35rem] tracking-[0.08em] gold-text">DocuMind</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.38em] text-mist/70">AI Atelier</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `relative text-[11px] uppercase tracking-[0.28em] transition ${
                    isActive ? 'text-gold-soft' : 'text-mist/80 hover:text-ivory'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 h-px w-full gold-line" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/workspace"
              className="hidden items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-gold-soft transition hover:bg-gold hover:text-ink md:inline-flex"
            >
              Open the vault
              <ArrowUpRight size={14} />
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center border border-gold/25 text-gold-soft lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gold/15 bg-ink/95 lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-6">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className="border-b border-gold/10 py-3 font-display text-2xl text-ivory"
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="relative overflow-hidden border-t border-gold/15 bg-ink">
        <img src="/images/neural-web.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-ink/80 to-ink/70" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
          <div className="md:col-span-2">
            <div className="font-display text-4xl gold-text">DocuMind AI</div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
              The intelligent document assistant for rooms where a wrong page number is worse than silence.
              Every answer cites the passage. Every passage remembers its page.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Navigate</div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-mist">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-gold-soft">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Stack</div>
            <ul className="mt-4 space-y-2 text-sm text-mist">
              <li>React 19 · Vite · TypeScript</li>
              <li>Node.js gateway · BullMQ</li>
              <li>Python NLP · pdfplumber · spaCy</li>
              <li>PostgreSQL 16 · pgvector</li>
            </ul>
          </div>
        </div>
        <div className="relative border-t border-gold/10 px-5 py-6 text-center text-[11px] uppercase tracking-[0.28em] text-mist/60 md:px-10">
          © 2026 DocuMind Atelier — documents remain yours, citations remain honest.
        </div>
      </footer>
    </div>
  );
}
