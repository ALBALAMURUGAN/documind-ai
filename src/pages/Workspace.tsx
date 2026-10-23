import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  FolderPlus,
  Folders,
  Highlighter,
  Loader2,
  MessageSquareQuote,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { loadWorkspace, saveWorkspace, resetWorkspace, appendMessage } from '../lib/storage';
import { answerQuestion, PROCESS_STAGES, searchPassages, topKeywords } from '../lib/nlp';
import { buildDocument, extractFromFile, uid, wait } from '../lib/pdf';
import type { ChatMessage, Citation, DocumentRecord, FolderRecord, Passage, WorkspaceState } from '../lib/types';

type Tab = 'ask' | 'summary' | 'search' | 'reader';

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

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
      <mark key={i} className="bg-gold/35 text-gold-soft">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const SUGGESTIONS = [
  'Summarize this document with citations',
  'What are the payment terms and fees?',
  'How is liability capped?',
  'List confidentiality obligations',
  'What is the termination notice period?',
  'Which entities and dates are named?',
];

export default function Workspace() {
  const [state, setState] = useState<WorkspaceState>(() => loadWorkspace());
  const [tab, setTab] = useState<Tab>('ask');
  const [query, setQuery] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [pipeline, setPipeline] = useState(false);
  const [stage, setStage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [focusPassage, setFocusPassage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveWorkspace(state);
  }, [state]);

  const folders = state.folders;
  const docs = useMemo(() => {
    if (state.activeFolderId === 'all') return state.documents;
    return state.documents.filter((d) => d.folderId === state.activeFolderId);
  }, [state.documents, state.activeFolderId]);

  const active = state.documents.find((d) => d.id === state.activeDocId) || docs[0] || null;
  const messages = active ? state.messages[active.id] || [] : [];

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, busy]);

  const vaultHits = useMemo(() => {
    if (!searchQ.trim()) return [];
    const corpus = state.activeFolderId === 'all' ? state.documents : docs;
    return searchPassages(searchQ, corpus, 16);
  }, [searchQ, state.documents, state.activeFolderId, docs]);

  const setActive = (id: string) => {
    setState((s) => ({ ...s, activeDocId: id }));
    setFocusPassage(null);
  };

  const ingestFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      setError(null);
      setBusy(true);
      setPipeline(true);
      setStage(0);
      try {
        for (const file of list) {
          const allowed = /\.(pdf|txt|md|markdown|docx)$/i.test(file.name) || file.type === 'application/pdf' || file.type.startsWith('text/');
          if (!allowed) {
            setError(`${file.name} is not a supported type. Use PDF, TXT, MD, or DOCX.`);
            continue;
          }
          for (let i = 0; i < PROCESS_STAGES.length; i++) {
            setStage(i);
            await wait(380 + Math.random() * 280);
          }
          const { pages, kind } = await extractFromFile(file);
          const folderId =
            state.activeFolderId === 'all' ? folders.find((f) => f.name === 'Inbox')?.id || folders[0].id : state.activeFolderId;
          const doc = buildDocument(file.name, file.size, folderId, pages, kind, 'upload');
          setState((s) => ({
            ...s,
            documents: [doc, ...s.documents],
            activeDocId: doc.id,
            activeFolderId: s.activeFolderId === 'all' ? 'all' : folderId,
          }));
          setTab('summary');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ingest failed');
      } finally {
        setBusy(false);
        setPipeline(false);
      }
    },
    [folders, state.activeFolderId],
  );

  const ask = async (text?: string) => {
    const q = (text ?? query).trim();
    if (!q || !active || busy) return;
    setQuery('');
    const userMsg: ChatMessage = { id: uid('m'), role: 'user', content: q, createdAt: Date.now() };
    setState((s) => appendMessage(s, active.id, userMsg));
    setBusy(true);
    setStage(PROCESS_STAGES.length - 1);
    await wait(420);
    const { answer, citations } = answerQuestion(q, active);
    const bot: ChatMessage = {
      id: uid('m'),
      role: 'assistant',
      content: answer,
      citations,
      createdAt: Date.now(),
    };
    setState((s) => appendMessage(s, active.id, bot));
    setBusy(false);
    if (citations[0]) {
      setFocusPassage(citations[0].passageId);
    }
  };

  const openCitation = (c: Citation) => {
    setFocusPassage(c.passageId);
    setTab('reader');
    setTimeout(() => {
      const el = document.getElementById(`pass-${c.passageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const addFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    const f: FolderRecord = {
      id: uid('folder'),
      name,
      hue: '#c4b5fd',
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, folders: [...s.folders, f], activeFolderId: f.id }));
    setFolderName('');
    setNewFolder(false);
  };

  const removeDoc = (id: string) => {
    setState((s) => {
      const documents = s.documents.filter((d) => d.id !== id);
      const messages = { ...s.messages };
      delete messages[id];
      return {
        ...s,
        documents,
        messages,
        activeDocId: s.activeDocId === id ? documents[0]?.id ?? null : s.activeDocId,
      };
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) ingestFiles(e.dataTransfer.files);
  };

  return (
    <div className="relative min-h-screen bg-void pt-20">
      <img src="/images/neural-web.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="relative mx-auto grid max-w-[1600px] gap-4 px-3 py-4 lg:grid-cols-[250px_minmax(0,1fr)_minmax(320px,400px)] lg:px-6">
        <aside className="glass h-fit p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Vault</div>
            <button onClick={() => setNewFolder(true)} className="text-gold-soft hover:text-gold" aria-label="New folder">
              <FolderPlus size={16} />
            </button>
          </div>
          {newFolder && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFolder()}
                className="w-full border border-gold/30 bg-void px-2 py-1 text-sm"
                placeholder="Folder name"
              />
              <button onClick={addFolder} className="bg-gold px-2 text-ink">
                <Plus size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => setState((s) => ({ ...s, activeFolderId: 'all' }))}
            className={`mt-4 flex w-full items-center gap-2 px-2 py-2 text-left text-sm ${
              state.activeFolderId === 'all' ? 'bg-gold/15 text-gold-soft' : 'text-mist hover:text-ivory'
            }`}
          >
            <Folders size={14} /> All folios
            <span className="ml-auto text-[10px] text-gold/70">{state.documents.length}</span>
          </button>
          <ul className="mt-1 space-y-1">
            {folders.map((f) => {
              const n = state.documents.filter((d) => d.folderId === f.id).length;
              return (
                <li key={f.id}>
                  <button
                    onClick={() => setState((s) => ({ ...s, activeFolderId: f.id }))}
                    className={`flex w-full items-center gap-2 px-2 py-2 text-left text-sm ${
                      state.activeFolderId === f.id ? 'bg-gold/15 text-gold-soft' : 'text-mist hover:text-ivory'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: f.hue }} />
                    {f.name}
                    <span className="ml-auto text-[10px] text-gold/70">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => fileRef.current?.click()}
            className="mt-5 flex w-full items-center justify-center gap-2 border border-gold/40 bg-gold/10 py-2.5 text-[11px] uppercase tracking-[0.22em] text-gold-soft hover:bg-gold hover:text-ink"
          >
            <Upload size={14} /> Upload folio
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            multiple
            accept=".pdf,.txt,.md,.markdown,.docx,application/pdf,text/plain"
            onChange={(e) => e.target.files && ingestFiles(e.target.files)}
          />
          <button
            onClick={() => {
              setState(resetWorkspace());
              setTab('ask');
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-[0.22em] text-mist/70 hover:text-gold"
          >
            <RotateCcw size={12} /> Reset demo vault
          </button>

          <div className="mt-6 max-h-[42vh] space-y-1 overflow-y-auto scrollbar-thin pr-1">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d.id)}
                className={`group flex w-full items-start gap-2 border px-2 py-2 text-left ${
                  active?.id === d.id ? 'border-gold/50 bg-gold/10' : 'border-transparent hover:border-gold/20'
                }`}
              >
                <FileText size={14} className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block truncate text-xs text-ivory">{d.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-mist/70">
                    {d.pages}p · {d.kind} · {bytes(d.size)}
                  </span>
                </span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDoc(d.id);
                  }}
                  className="ml-auto hidden text-mist hover:text-gold group-hover:block"
                >
                  <Trash2 size={12} />
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative min-h-[70vh] border ${dragging ? 'border-gold bg-gold/10' : 'border-gold/15'} bg-ink/60`}
        >
          {dragging && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-void/70 text-[12px] uppercase tracking-[0.3em] text-gold">
              Release to ingest
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1 border-b border-gold/15 px-3 py-2">
            {(
              [
                ['ask', 'Ask', MessageSquareQuote],
                ['summary', 'Summary', Sparkles],
                ['search', 'Search', Search],
                ['reader', 'Reader', Highlighter],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.22em] ${
                  tab === id ? 'bg-gold text-ink' : 'text-mist hover:text-ivory'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
            {active && (
              <div className="ml-auto hidden truncate text-[11px] uppercase tracking-[0.18em] text-gold/80 md:block">
                {active.name}
              </div>
            )}
          </div>

          {!active ? (
            <EmptyVault onUpload={() => fileRef.current?.click()} />
          ) : tab === 'ask' ? (
            <AskPanel
              active={active}
              messages={messages}
              query={query}
              setQuery={setQuery}
              ask={ask}
              busy={busy}
              chatEnd={chatEnd}
              openCitation={openCitation}
            />
          ) : tab === 'summary' ? (
            <SummaryPanel doc={active} onAsk={(q) => { setTab('ask'); setTimeout(() => ask(q), 0); }} />
          ) : tab === 'search' ? (
            <SearchPanel
              searchQ={searchQ}
              setSearchQ={setSearchQ}
              hits={vaultHits}
              onOpen={(docId, passage) => {
                setActive(docId);
                setFocusPassage(passage.id);
                setTab('reader');
                setTimeout(() => {
                  document.getElementById(`pass-${passage.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
            />
          ) : (
            <ReaderPanel
              doc={active}
              query={searchQ}
              focusPassage={focusPassage}
              setFocusPassage={setFocusPassage}
              readerRef={readerRef}
            />
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="glass overflow-hidden">
            <img src="/images/orb.jpg" alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold">Pipeline</div>
              <p className="mt-2 text-xs leading-relaxed text-mist">
                Node ingest → Python parse & NLP → PostgreSQL + pgvector → grounded answer with page citations.
              </p>
            </div>
          </div>

          {active && (
            <div className="border border-gold/20 bg-plum/50 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-gold">Indexed folio</div>
              <div className="mt-2 font-display text-2xl leading-tight">{active.name}</div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-mist">
                <div>
                  <dt className="text-gold/80">Pages</dt>
                  <dd>{active.pages}</dd>
                </div>
                <div>
                  <dt className="text-gold/80">Passages</dt>
                  <dd>{active.passages.length}</dd>
                </div>
                <div>
                  <dt className="text-gold/80">Kind</dt>
                  <dd className="uppercase">{active.kind}</dd>
                </div>
                <div>
                  <dt className="text-gold/80">Origin</dt>
                  <dd className="capitalize">{active.source}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1">
                {active.summary.topics.map((t) => (
                  <span key={t} className="border border-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold-soft">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gold/15 bg-ink p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-gold">Suggested questions</div>
            <div className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={!active}
                  onClick={() => {
                    setTab('ask');
                    setTimeout(() => ask(s), 0);
                  }}
                  className="border border-gold/10 px-3 py-2 text-left text-xs text-mist hover:border-gold/40 hover:text-ivory disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {pipeline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-void/70 backdrop-blur-sm"
          >
            <div className="w-[min(520px,92vw)] border border-gold/30 bg-ink p-8">
              <div className="flex items-center gap-3 text-gold">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-[11px] uppercase tracking-[0.3em]">
                  {PROCESS_STAGES[Math.min(stage, PROCESS_STAGES.length - 1)].layer} · working
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {PROCESS_STAGES.map((s, i) => (
                  <div key={s.id} className={`border-l-2 pl-4 ${i <= stage ? 'border-gold' : 'border-gold/20 opacity-40'}`}>
                    <div className="text-sm text-ivory">{s.label}</div>
                    <div className="text-xs text-mist">{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 border border-gold/40 bg-ink px-4 py-3 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyVault({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
      <img src="/images/logo-mark.png" alt="" className="h-20 w-20 opacity-80" />
      <h2 className="mt-6 font-display text-4xl">The vault is waiting</h2>
      <p className="mt-3 max-w-md text-sm text-mist">Drop a PDF or text folio, or restore the demo corpus from the sidebar.</p>
      <button
        onClick={onUpload}
        className="mt-6 bg-gold px-5 py-2 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-gold-soft"
      >
        Upload a document
      </button>
    </div>
  );
}

function AskPanel({
  active,
  messages,
  query,
  setQuery,
  ask,
  busy,
  chatEnd,
  openCitation,
}: {
  active: DocumentRecord;
  messages: ChatMessage[];
  query: string;
  setQuery: (s: string) => void;
  ask: (t?: string) => void;
  busy: boolean;
  chatEnd: React.RefObject<HTMLDivElement | null>;
  openCitation: (c: Citation) => void;
}) {
  return (
    <div className="flex h-[68vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
        {messages.length === 0 && (
          <div className="border border-gold/15 p-6">
            <p className="font-display text-3xl italic gold-text">Ask the folio.</p>
            <p className="mt-3 text-sm text-mist">
              {active.name} is indexed across {active.pages} pages and {active.passages.length} passages. Every
              answer will cite a page you can open.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'ml-8 border border-gold/20 bg-gold/10 p-4' : 'mr-4 border border-violet/30 bg-grape/50 p-4'}>
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold">
              {m.role === 'user' ? 'You' : 'DocuMind'}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ivory">{m.content}</p>
            {m.citations && m.citations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.citations.map((c) => (
                  <button
                    key={c.passageId}
                    onClick={() => openCitation(c)}
                    className="border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gold-soft hover:bg-gold hover:text-ink"
                    title={c.snippet}
                  >
                    p. {c.page} · {c.score.toFixed(2)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="mr-4 border border-violet/30 bg-grape/40 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
              <Loader2 size={12} className="animate-spin" /> Retrieving passages
            </div>
            <p className="mt-2 text-sm text-mist">Hybrid BM25 ranker is lining citations to pages…</p>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex gap-2 border-t border-gold/15 p-3"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask ${active.name}…`}
          className="flex-1 border border-gold/25 bg-void px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          disabled={busy || !query.trim()}
          className="bg-gold px-4 text-[11px] uppercase tracking-[0.22em] text-ink disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}

function SummaryPanel({ doc, onAsk }: { doc: DocumentRecord; onAsk: (q: string) => void }) {
  const kws = doc.summary.keywords.length ? doc.summary.keywords : topKeywords(doc.rawText, 10);
  return (
    <div className="h-[68vh] overflow-y-auto p-6 scrollbar-thin">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Abstract</p>
      <p className="mt-3 font-display text-2xl leading-snug text-ivory">{doc.summary.abstract}</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Takeaways</p>
          <ul className="mt-3 space-y-3">
            {doc.summary.bullets.map((b, i) => (
              <li key={i} className="border-l border-gold/40 pl-3 text-sm text-mist">
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Entities</p>
          <ul className="mt-3 space-y-2">
            {doc.summary.entities.length ? (
              doc.summary.entities.map((e) => (
                <li key={e.label + e.value} className="flex justify-between gap-3 text-sm">
                  <span className="text-mist">{e.label}</span>
                  <span className="text-gold-soft">{e.value}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-mist">No named entities extracted — try a denser folio.</li>
            )}
          </ul>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold">Keywords</p>
          <div className="mt-3 space-y-2">
            {kws.map((k) => (
              <div key={k.term} className="flex items-center gap-3 text-xs">
                <span className="w-28 truncate text-mist">{k.term}</span>
                <div className="h-1.5 flex-1 bg-grape">
                  <div className="h-full bg-gradient-to-r from-violet to-gold" style={{ width: `${k.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => onAsk('Summarize this document with citations')}
        className="mt-8 border border-gold/40 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-gold-soft hover:bg-gold hover:text-ink"
      >
        Ask for a cited summary
      </button>
    </div>
  );
}

function SearchPanel({
  searchQ,
  setSearchQ,
  hits,
  onOpen,
}: {
  searchQ: string;
  setSearchQ: (s: string) => void;
  hits: ReturnType<typeof searchPassages>;
  onOpen: (docId: string, passage: Passage) => void;
}) {
  return (
    <div className="flex h-[68vh] flex-col">
      <div className="border-b border-gold/15 p-4">
        <div className="flex items-center gap-2 border border-gold/25 bg-void px-3 py-2">
          <Search size={14} className="text-gold" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search keywords across the vault…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {!searchQ && <p className="text-sm text-mist">Try “liability”, “encryption”, “uptime”, or a party name.</p>}
        <ul className="space-y-3">
          {hits.map((h) => (
            <li key={h.documentId + h.passage.id}>
              <button
                onClick={() => onOpen(h.documentId, h.passage)}
                className="w-full border border-gold/15 p-4 text-left hover:border-gold/50"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold">
                  {h.documentName} · page {h.passage.page} · {h.score.toFixed(2)}
                </div>
                <p className="mt-2 text-sm text-ivory">{highlight(h.passage.text, searchQ)}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReaderPanel({
  doc,
  query,
  focusPassage,
  setFocusPassage,
  readerRef,
}: {
  doc: DocumentRecord;
  query: string;
  focusPassage: string | null;
  setFocusPassage: (id: string | null) => void;
  readerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={readerRef} className="h-[68vh] overflow-y-auto p-5 scrollbar-thin md:p-8">
      {doc.passages.map((p) => {
        const active = focusPassage === p.id;
        return (
          <article
            id={`pass-${p.id}`}
            key={p.id}
            onClick={() => setFocusPassage(p.id)}
            className={`mb-4 cursor-pointer border px-4 py-4 transition ${
              active ? 'border-gold bg-gold/15' : 'border-transparent hover:border-gold/20'
            }`}
          >
            <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-gold/80">
              Page {p.page}
              {p.heading ? ` · ${p.heading}` : ''}
            </div>
            <p className="font-display text-[1.12rem] leading-relaxed">{query ? highlight(p.text, query) : p.text}</p>
          </article>
        );
      })}
    </div>
  );
}
