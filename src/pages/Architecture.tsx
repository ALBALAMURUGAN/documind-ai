import { motion } from 'framer-motion';
import { Cpu, Database, Layers, Network, Server, Sparkles } from 'lucide-react';
import { PROCESS_STAGES } from '../lib/nlp';

const LAYERS = [
  {
    icon: Layers,
    name: 'React atelier',
    hue: 'text-gold',
    items: [
      'Vite + React 19 + TypeScript surface',
      'pdf.js extraction in the browser for instant demos',
      'Citation chips, passage highlighter, folder taxonomies',
      'Local-first workspace persisted to the vault cache',
    ],
  },
  {
    icon: Server,
    name: 'Node.js gateway',
    hue: 'text-lilac',
    items: [
      'Express multipart ingest, SHA-256, object storage',
      'BullMQ jobs for parse / embed / evaluate',
      'Signed URLs for original PDFs',
      'WebSocket stream of processing stages',
    ],
  },
  {
    icon: Cpu,
    name: 'Python NLP workers',
    hue: 'text-gold-soft',
    items: [
      'pdfplumber + pypdf geometry and reading order',
      'Tesseract OCR fallback for scanned pages',
      'spaCy NER, heading detection, sentence split',
      'MiniLM embeddings + cross-encoder rerank',
    ],
  },
  {
    icon: Database,
    name: 'PostgreSQL 16',
    hue: 'text-lilac',
    items: [
      'documents, folders, passages, chats',
      'pgvector IVFFlat for 384-d embeddings',
      'passage_boxes for visual overlays',
      'Row-level security by tenant',
    ],
  },
];

const TABLES = [
  { name: 'folders', cols: 'id uuid pk · tenant_id · name · hue · created_at' },
  { name: 'documents', cols: 'id uuid pk · folder_id fk · sha256 · pages · status · s3_key' },
  { name: 'passages', cols: 'id uuid pk · document_id fk · page · heading · text · tsv' },
  { name: 'embeddings', cols: 'passage_id pk · vector vector(384) · model' },
  { name: 'passage_boxes', cols: 'passage_id · page · x · y · w · h' },
  { name: 'messages', cols: 'id · document_id · role · content · citations jsonb' },
];

export default function Architecture() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <img src="/images/stack-icons.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/80 to-void" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.38em] text-gold">System of record</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
            React in the salon.
            <span className="italic gold-text"> Node at the door. Python in the workshop. Postgres in the vault.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-mist">
            The public atelier is a Vite application. Production traffic still travels the same four rooms: a Node
            gateway, Python linguistic workers, a PostgreSQL memory, and an LLM that is only allowed to speak with
            citations.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 md:grid-cols-2 md:px-10">
        {LAYERS.map((l, i) => (
          <motion.article
            key={l.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="border border-gold/15 bg-plum/50 p-8"
          >
            <l.icon className={l.hue} />
            <h2 className="mt-4 font-display text-3xl">{l.name}</h2>
            <ul className="mt-5 space-y-2 text-sm text-mist">
              {l.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <span className="text-gold">▸</span>
                  {it}
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </section>

      <section className="relative my-16 overflow-hidden">
        <video className="absolute inset-0 h-full w-full object-cover opacity-30" autoPlay muted loop playsInline src="/videos/violet-waves.mp4" />
        <div className="absolute inset-0 bg-void/70" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Live pipeline</p>
          <h2 className="mt-3 font-display text-5xl">What happens after you drop a file</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {PROCESS_STAGES.map((s) => (
              <div key={s.id} className="border border-gold/20 bg-ink/80 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-gold">{s.layer}</div>
                <div className="mt-3 font-display text-2xl">{s.label}</div>
                <p className="mt-3 text-xs leading-relaxed text-mist">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Schema</p>
            <h2 className="mt-3 font-display text-5xl">A database that remembers pages</h2>
            <p className="mt-5 leading-relaxed text-mist">
              Folders, documents, passages, embeddings, bounding boxes, and chat transcripts. Full-text search via
              tsvector sits beside pgvector so a defined term and a paraphrase can both find the clause.
            </p>
            <div className="mt-8 overflow-hidden border border-gold/20">
              <img src="/images/pipeline.jpg" alt="Document intelligence pipeline" className="w-full object-cover" />
            </div>
          </div>
          <div className="space-y-3">
            {TABLES.map((t) => (
              <div key={t.name} className="border border-gold/15 bg-ink p-4">
                <div className="font-mono text-sm text-gold">{t.name}</div>
                <div className="mt-1 font-mono text-[11px] leading-relaxed text-mist">{t.cols}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gold/15 bg-ink py-20">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex items-center gap-3 text-gold">
            <Network size={18} />
            <span className="text-[11px] uppercase tracking-[0.38em]">LLM contract</span>
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            The model may speak only with a footnote.
          </h2>
          <p className="mt-5 max-w-2xl text-mist">
            Prompts require extractive quotes for figures, dates, and defined terms. If the top passage score is below
            0.18 the system refuses. This atelier demonstrates the same discipline locally with a BM25 ranker so you
            can feel the product without a key.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Retrieve', d: 'Hybrid BM25 + MiniLM, top 24, cross-encoder rerank to 4.' },
              { t: 'Ground', d: 'Generator sees only those passages. No open-web browsing.' },
              { t: 'Cite', d: 'Each sentence maps to passage_id and page. Chips open the reader.' },
            ].map((c) => (
              <div key={c.t} className="border border-gold/20 p-6">
                <Sparkles className="text-gold" size={16} />
                <h3 className="mt-3 font-display text-2xl">{c.t}</h3>
                <p className="mt-2 text-sm text-mist">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
