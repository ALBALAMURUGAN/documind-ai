import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Highlighter, MousePointerClick, Search } from 'lucide-react';
import { SAMPLE_DOCS } from '../lib/samples';
import { paginateText, passagesFromPages, searchPassages } from '../lib/nlp';
import { buildDocument } from '../lib/pdf';
import type { Passage } from '../lib/types';

function highlight(text: string, query: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    terms.some((t) => part.toLowerCase() === t) ? (
      <mark key={i} className="bg-gold/30 text-gold-soft">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function Studio() {
  const doc = useMemo(() => {
    const s = SAMPLE_DOCS[0];
    const pages = paginateText(s.text, 1400);
    return buildDocument(s.name, s.text.length, 'folder-legal', pages, 'pdf', 'sample', s.notes);
  }, []);

  const [q, setQ] = useState('liability fees termination');
  const [focus, setFocus] = useState<Passage | null>(doc.passages[5] || doc.passages[0]);

  const hits = useMemo(() => searchPassages(q, [doc], 8), [q, doc]);

  return (
    <div className="pt-24">
      <section className="relative overflow-hidden border-b border-gold/15">
        <video className="absolute inset-0 h-full w-full object-cover opacity-25" autoPlay muted loop playsInline src="/videos/reading.mp4" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/80 to-void" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Citation studio</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
            Watch the clause
            <span className="italic gold-text"> catch the light.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-mist">
            A living demonstration of passage highlighting on the Helios Master Services Agreement. Search, click a
            hit, and the original wording is painted in gold.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_380px] md:px-10">
        <div className="border border-gold/20 bg-ink">
          <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-gold">
            <span className="flex items-center gap-2">
              <Highlighter size={14} /> {doc.name}
            </span>
            <span>{doc.pages} pages · {doc.passages.length} passages</span>
          </div>
          <div className="scrollbar-thin max-h-[70vh] overflow-y-auto p-6 md:p-10">
            {doc.passages.map((p) => {
              const active = focus?.id === p.id;
              const related = hits.some((h) => h.passage.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setFocus(p)}
                  className={`mb-4 w-full rounded-sm border px-4 py-4 text-left transition ${
                    active
                      ? 'border-gold bg-gold/15'
                      : related
                        ? 'border-violet/40 bg-violet/10'
                        : 'border-transparent hover:border-gold/20'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-gold/80">
                    <span>Page {p.page}{p.heading ? ` · ${p.heading}` : ''}</span>
                    {active && <span className="text-gold-soft">Focused</span>}
                  </div>
                  <p className="font-display text-[1.15rem] leading-relaxed text-ivory/95">{highlight(p.text, q)}</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-gold/20 bg-plum/50 p-5">
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold">
              <Search size={14} /> Illuminate
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-3 w-full border border-gold/20 bg-void px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
              placeholder="liability, fees, encryption…"
            />
            <p className="mt-3 text-xs text-mist">Gold = focused passage. Violet = other keyword hits.</p>
          </div>

          <div className="border border-gold/20 bg-ink p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold">
              <MousePointerClick size={14} /> Hits
            </div>
            <ul className="mt-4 space-y-3">
              {hits.map((h) => (
                <li key={h.passage.id}>
                  <button
                    onClick={() => setFocus(h.passage)}
                    className="w-full border border-gold/10 p-3 text-left hover:border-gold/40"
                  >
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
                      Page {h.passage.page} · score {h.score.toFixed(2)}
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs text-mist">{h.passage.text}</p>
                  </button>
                </li>
              ))}
              {!hits.length && <li className="text-sm text-mist">No illuminated spans for that query.</li>}
            </ul>
          </div>

          <Link
            to="/workspace"
            className="flex items-center justify-center border border-gold/40 bg-gold/10 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-gold-soft hover:bg-gold hover:text-ink"
          >
            Try this on your own files
          </Link>
        </aside>
      </section>
    </div>
  );
}
