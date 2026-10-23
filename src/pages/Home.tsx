import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Folders,
  Highlighter,
  MessageSquareQuote,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const STATS = [
  { k: '93.4%', v: 'correct page citations' },
  { k: '88.1%', v: 'exact passage spans' },
  { k: '1.1%', v: 'hallucinated citations' },
  { k: '< 8s', v: 'time to verify a clause' },
];

const PILLARS = [
  {
    icon: BookOpenCheck,
    title: 'Summaries that remember the page',
    copy: 'Abstracts, entities, and keywords are distilled from the original geometry — not from a model’s mood.',
    img: '/images/feature-summarize.jpg',
  },
  {
    icon: MessageSquareQuote,
    title: 'Questions with footnotes built in',
    copy: 'Ask like a colleague. Receive an answer stitched to passages, scored, and openable in the reader.',
    img: '/images/feature-qa.jpg',
  },
  {
    icon: ScanSearch,
    title: 'Search that lights the clause',
    copy: 'Hybrid BM25 and embeddings find the sentence. Gold for the focused hit, violet for every sibling.',
    img: '/images/feature-search.jpg',
  },
  {
    icon: Folders,
    title: 'A vault, not a pile',
    copy: 'Folders, categories, and a private index. Legal, research, compliance, product — each with its own hue.',
    img: '/images/feature-folders.jpg',
  },
];

const STEPS = [
  { n: '01', t: 'Ingest', d: 'PDF, Markdown, and plain text enter the Node gateway. Hashed, stored, enqueued.' },
  { n: '02', t: 'Parse', d: 'Python reads geometry with pdfplumber, recovers reading order, OCRs when needed.' },
  { n: '03', t: 'Index', d: 'Passages, entities, and MiniLM vectors land in PostgreSQL with pgvector.' },
  { n: '04', t: 'Reason', d: 'Ask. Retrieve. Cite. Highlight. Verify. Repeat until the clause is glowing.' },
];

const MARQUEE = [
  'PDF geometry',
  'Named-entity recognition',
  'Hybrid retrieval',
  'Passage highlighting',
  'Folder taxonomies',
  'Citation-first answers',
  'AES-256 at rest',
  'pgvector IVFFlat',
  'spaCy pipelines',
  'Node gateway',
  'Python workers',
  'Postgres 16',
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  return (
    <div>
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/violet-waves.mp4"
        />
        <img src="/images/hero-mind.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/35 to-void" />
        <div className="absolute inset-0 vignette" />

        <motion.div style={{ y, opacity }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-20 pt-32 md:px-10 md:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] uppercase tracking-[0.42em] text-gold"
          >
            Intelligent document assistant · est. atelier 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-5 max-w-5xl font-display text-[3.2rem] leading-[0.92] text-ivory sm:text-7xl lg:text-[6.4rem]"
          >
            Every answer should
            <span className="italic gold-text"> glow</span>
            <br />
            on the original page.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-mist md:text-lg"
          >
            Upload a contract, a brief, a filing. DocuMind extracts, summarizes, and answers — always with a
            citation you can open. Built on React, Node, Python, and PostgreSQL. Designed like jewelry.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 bg-gold px-6 py-3 text-[12px] uppercase tracking-[0.28em] text-ink transition hover:bg-gold-soft"
            >
              Enter the vault <ArrowRight size={16} />
            </Link>
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 border border-gold/40 px-6 py-3 text-[12px] uppercase tracking-[0.28em] text-gold-soft hover:bg-gold/10"
            >
              Inspect the stack
            </Link>
          </motion.div>
        </motion.div>

        <img
          src="/images/orb.jpg"
          alt=""
          className="animate-floaty pointer-events-none absolute right-[6%] top-[22%] hidden w-36 drop-shadow-[0_0_40px_rgba(212,175,55,0.45)] lg:block"
        />
      </section>

      <div className="relative overflow-hidden border-y border-gold/15 bg-ink py-4">
        <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="text-[11px] uppercase tracking-[0.42em] text-gold/80">
              ✦ {m}
            </span>
          ))}
        </div>
      </div>

      <section className="relative overflow-hidden py-24 md:py-32">
        <img src="/images/gold-foil.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-void/80" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 md:grid-cols-4 md:px-10">
          {STATS.map((s) => (
            <div key={s.v} className="border-l border-gold/30 pl-5">
              <div className="font-display text-5xl gold-text md:text-6xl">{s.k}</div>
              <div className="mt-2 text-[12px] uppercase tracking-[0.22em] text-mist">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-8">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
          <div className="relative overflow-hidden">
            <video className="h-[520px] w-full object-cover" autoPlay muted loop playsInline src="/videos/reading.mp4" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 glass p-5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold">In the room</div>
              <p className="mt-2 font-display text-2xl italic text-ivory">
                Counsel does not want poetry. Counsel wants the clause, highlighted.
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-gold">The promise</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">
              An atelier for
              <span className="italic gold-text"> documents that matter.</span>
            </h2>
            <p className="mt-6 text-mist leading-relaxed">
              DocuMind is not a chatbot wearing a file icon. It is a private intelligence layer over your corpus:
              ingestion on Node, linguistic craft in Python, memory in PostgreSQL, and a React surface that treats
              citations as first-class jewelry.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Upload PDF and text. Geometry is respected.',
                'Automatic summaries, entities, and keywords.',
                'Ask anything — answers arrive with page references.',
                'Keyword search paints every relevant span.',
                'Folders keep legal, research, and product apart.',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-ivory/90">
                  <Sparkles className="mt-0.5 shrink-0 text-gold" size={16} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Capabilities</p>
              <h2 className="mt-3 font-display text-5xl md:text-6xl">Crafted instruments</h2>
            </div>
            <Link to="/studio" className="text-[12px] uppercase tracking-[0.28em] text-gold-soft hover:text-gold">
              Open citation studio →
            </Link>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08 }}
                className="group overflow-hidden border border-gold/15 bg-plum/40"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={p.img} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                </div>
                <div className="p-7">
                  <p.icon className="text-gold" size={22} />
                  <h3 className="mt-4 font-display text-3xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{p.copy}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <img src="/images/pipeline.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-void/75" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Four movements</p>
          <h2 className="mt-3 max-w-3xl font-display text-5xl md:text-6xl">From folio to citation, without losing the thread.</h2>
          <div className="mt-16 grid gap-px bg-gold/20 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-ink p-8">
                <div className="font-display text-4xl text-gold/70">{s.n}</div>
                <h3 className="mt-4 font-display text-3xl">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
          <div className="relative">
            <img src="/images/citation.jpg" alt="Highlighted citation overlay" className="w-full border border-gold/20" />
            <div className="absolute -bottom-8 -right-4 hidden w-48 border border-gold/30 bg-ink/90 p-4 lg:block">
              <Highlighter className="text-gold" size={18} />
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-gold-soft">Live overlay</p>
              <p className="mt-1 text-xs text-mist">Gold for the focused span. Violet for every other hit.</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Verification</p>
            <h2 className="mt-3 font-display text-5xl leading-tight">
              If it cannot be opened to a page, it is not an answer.
            </h2>
            <p className="mt-6 leading-relaxed text-mist">
              DocuMind refuses low-confidence guesses. Hybrid retrieval blends lexical BM25 with MiniLM embeddings,
              then a reranker keeps only the passages that actually contain the claim. The React reader pulses the
              span so a human can agree — or not.
            </p>
            <div className="mt-8 flex items-start gap-4 border border-gold/20 p-5">
              <ShieldCheck className="mt-0.5 text-gold" />
              <p className="text-sm text-mist">
                Customer documents are never used to train foundation models unless an Opt-In Training Addendum is
                executed. Residuals in personnel memory exclude personal data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src="/images/vault.jpg" alt="" className="h-[70vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 md:px-10">
            <h2 className="max-w-3xl font-display text-5xl md:text-7xl">
              Your private vault.
              <span className="italic gold-text"> Already lit.</span>
            </h2>
            <p className="mt-5 max-w-lg text-mist">
              Four sample folios wait inside — an MSA, a research brief, a SOC 2 narrative, a product spec. Upload
              your own. Ask them anything.
            </p>
            <Link
              to="/workspace"
              className="mt-8 inline-flex items-center gap-2 bg-gold px-6 py-3 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-gold-soft"
            >
              Open the vault <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
