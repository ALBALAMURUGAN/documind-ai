import type { Citation, DocSummary, Passage, ProcessStage, SearchHit, DocumentRecord } from './types';

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that', 'these',
  'those', 'it', 'its', 'their', 'there', 'what', 'which', 'who', 'whom', 'how', 'when',
  'where', 'why', 'can', 'could', 'would', 'should', 'may', 'might', 'will', 'shall', 'do',
  'does', 'did', 'have', 'has', 'had', 'not', 'no', 'if', 'then', 'than', 'so', 'such',
  'into', 'about', 'over', 'after', 'before', 'between', 'through', 'during', 'without',
  'within', 'your', 'you', 'we', 'our', 'i', 'me', 'my', 'they', 'them', 'his', 'her',
  'also', 'any', 'all', 'each', 'other', 'more', 'most', 'some', 'only', 'own', 'same',
  'too', 'very', 'just', 'because', 'until', 'while', 'both', 'few', 'nor', 'once',
  'under', 'again', 'further', 'here', 'there', 'out', 'off', 'up', 'down', 'per',
]);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ''))
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 28);
}

export function paginateText(text: string, charsPerPage = 1650): { page: number; text: string }[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const pages: { page: number; text: string }[] = [];
  const blocks = clean.split(/\n{2,}/);
  let buf = '';
  let page = 1;
  for (const block of blocks) {
    if ((buf + '\n\n' + block).length > charsPerPage && buf) {
      pages.push({ page, text: buf.trim() });
      page += 1;
      buf = block;
    } else {
      buf = buf ? `${buf}\n\n${block}` : block;
    }
  }
  if (buf.trim()) pages.push({ page, text: buf.trim() });
  return pages.length ? pages : [{ page: 1, text: clean }];
}

export function passagesFromPages(pages: { page: number; text: string }[]): Passage[] {
  const out: Passage[] = [];
  let idx = 0;
  for (const p of pages) {
    const chunks = chunkPage(p.text);
    for (const c of chunks) {
      out.push({
        id: `p-${p.page}-${idx}`,
        page: p.page,
        index: idx,
        text: c.text,
        heading: c.heading,
      });
      idx += 1;
    }
  }
  return out;
}

function chunkPage(pageText: string): { heading?: string; text: string }[] {
  const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean);
  const chunks: { heading?: string; text: string }[] = [];
  let heading: string | undefined;
  let buf: string[] = [];
  const flush = () => {
    const t = buf.join(' ').trim();
    if (t.length > 40) chunks.push({ heading, text: t });
    buf = [];
  };
  for (const line of lines) {
    if (isHeading(line)) {
      flush();
      heading = line.replace(/:$/, '');
      continue;
    }
    buf.push(line);
    if (buf.join(' ').length > 520) flush();
  }
  flush();
  if (!chunks.length && pageText.trim()) chunks.push({ text: pageText.trim() });
  return chunks;
}

function isHeading(line: string): boolean {
  if (line.length > 90) return false;
  if (/^(article|section|clause|exhibit|appendix|schedule)\b/i.test(line)) return true;
  if (/^\d+(\.\d+)*\s+[A-Z]/.test(line)) return true;
  if (/^[A-Z][A-Z0-9 &/,-]{8,}$/.test(line)) return true;
  return false;
}

export function summarizeDocument(name: string, pages: { page: number; text: string }[], passages: Passage[]): DocSummary {
  const full = pages.map((p) => p.text).join('\n\n');
  const sentences = splitSentences(full);
  const keywords = topKeywords(full, 12);
  const keySet = new Set(keywords.map((k) => k.term));
  const ranked = sentences
    .map((s) => {
      const toks = tokenize(s);
      const overlap = toks.filter((t) => keySet.has(t)).length;
      const pos = sentences.indexOf(s);
      const loc = pos < 4 ? 1.25 : pos < 12 ? 1.1 : 1;
      return { s, score: overlap * loc + Math.min(s.length, 280) / 400 };
    })
    .sort((a, b) => b.score - a.score);

  const abstractParts: string[] = [];
  for (const r of ranked) {
    if (abstractParts.length >= 3) break;
    if (abstractParts.some((p) => similar(p, r.s))) continue;
    abstractParts.push(r.s);
  }
  const abstract =
    abstractParts.join(' ') ||
    `${name} is a ${pages.length}-page document containing ${passages.length} indexed passages.`;

  const bullets = ranked
    .filter((r) => !abstractParts.includes(r.s))
    .slice(0, 5)
    .map((r) => trimSentence(r.s));

  return {
    abstract: trimSentence(abstract, 620),
    bullets: bullets.length ? bullets : passages.slice(0, 4).map((p) => trimSentence(p.text, 180)),
    entities: extractEntities(full),
    keywords,
    topics: keywords.slice(0, 5).map((k) => titleCase(k.term)),
  };
}

export function topKeywords(text: string, n = 10): { term: string; weight: number }[] {
  const toks = tokenize(text);
  const freq = new Map<string, number>();
  for (const t of toks) freq.set(t, (freq.get(t) || 0) + 1);
  const max = Math.max(...freq.values(), 1);
  return [...freq.entries()]
    .filter(([, c]) => c > 1 || toks.length < 80)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([term, c]) => ({ term, weight: Math.round((c / max) * 100) }));
}

function extractEntities(text: string): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const money = text.match(/\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|m|bn))?/gi);
  if (money?.[0]) out.push({ label: 'Consideration', value: money[0] });
  const pct = text.match(/\b\d{1,3}(?:\.\d+)?%/g);
  if (pct?.[0]) out.push({ label: 'Rate / threshold', value: pct[0] });
  const dates = text.match(
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/g,
  );
  if (dates?.[0]) out.push({ label: 'Date', value: dates[0] });
  const parties = text.match(/\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3}\s(?:Inc\.|LLC|Ltd\.|Corp\.|LLP|PLC|GmbH))\b/g);
  if (parties) {
    const uniq = [...new Set(parties)].slice(0, 3);
    uniq.forEach((p, i) => out.push({ label: i === 0 ? 'Party' : 'Counterparty', value: p }));
  }
  const emails = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  if (emails?.[0]) out.push({ label: 'Contact', value: emails[0] });
  return out.slice(0, 6);
}

function similar(a: string, b: string): boolean {
  const ta = new Set(tokenize(a));
  const tb = tokenize(b);
  if (!tb.length) return false;
  const inter = tb.filter((t) => ta.has(t)).length;
  return inter / tb.length > 0.62;
}

function trimSentence(s: string, max = 240): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

type Scored = { passage: Passage; score: number };

function bm25(query: string, passages: Passage[], k1 = 1.5, b = 0.75): Scored[] {
  const q = tokenize(query);
  if (!q.length || !passages.length) return [];
  const docs = passages.map((p) => tokenize(p.text));
  const avgdl = docs.reduce((s, d) => s + d.length, 0) / docs.length;
  const df = new Map<string, number>();
  for (const term of new Set(q)) {
    df.set(term, docs.filter((d) => d.includes(term)).length);
  }
  const N = docs.length;
  return passages
    .map((passage, i) => {
      const d = docs[i];
      const tfMap = new Map<string, number>();
      for (const t of d) tfMap.set(t, (tfMap.get(t) || 0) + 1);
      let score = 0;
      for (const term of q) {
        const tf = tfMap.get(term) || 0;
        const n = df.get(term) || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const denom = tf + k1 * (1 - b + b * (d.length / avgdl));
        score += idf * ((tf * (k1 + 1)) / (denom || 1));
      }
      const headingBoost = passage.heading && q.some((t) => passage.heading!.toLowerCase().includes(t)) ? 0.35 : 0;
      return { passage, score: score + headingBoost };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function searchPassages(query: string, docs: DocumentRecord[], limit = 12): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const ranked = bm25(query, doc.passages).slice(0, 4);
    for (const r of ranked) {
      hits.push({
        documentId: doc.id,
        documentName: doc.name,
        passage: r.passage,
        score: r.score,
      });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function answerQuestion(question: string, doc: DocumentRecord): { answer: string; citations: Citation[] } {
  const q = question.trim();
  const lower = q.toLowerCase();
  const ranked = bm25(q, doc.passages);
  const top = ranked.slice(0, 4);

  if (/summar(y|ise|ize)|overview|tl;dr|what is this/.test(lower)) {
    const citations = citationsFrom(doc, ranked.slice(0, 3));
    return {
      answer: composeSummaryAnswer(doc, citations),
      citations,
    };
  }

  if (/keyword|topic|theme|entities|named entity/.test(lower)) {
    const citations = citationsFrom(doc, ranked.slice(0, 2));
    return {
      answer: `Salient themes in ${doc.name}: ${doc.summary.topics.join(', ') || 'general discourse'}. Dominant terms — ${doc.summary.keywords
        .slice(0, 8)
        .map((k) => k.term)
        .join(', ')}. ${doc.summary.entities.length ? 'Extracted entities include ' + doc.summary.entities.map((e) => `${e.label}: ${e.value}`).join('; ') + '.' : ''}`,
      citations,
    };
  }

  if (!top.length) {
    return {
      answer: `I could not locate a passage in “${doc.name}” that answers this with high confidence. Try a more specific clause, party, figure, or heading — or search the vault across all documents.`,
      citations: [],
    };
  }

  const citations = citationsFrom(doc, top);
  const lead = top[0].passage;
  const second = top[1]?.passage;
  const third = top[2]?.passage;

  const answer = [
    `According to ${doc.name}, page ${lead.page}${lead.heading ? ` (${lead.heading})` : ''}: ${trimSentence(lead.text, 320)}`,
    second
      ? `A supporting passage on page ${second.page} adds: ${trimSentence(second.text, 240)}`
      : '',
    third && /how|why|compare|difference|risk|liability|term|payment|endpoint/.test(lower)
      ? `Further context on page ${third.page}: ${trimSentence(third.text, 200)}`
      : '',
    `Every claim above is grounded in the cited passages so you can verify the original wording.`,
  ]
    .filter(Boolean)
    .join(' ');

  return { answer, citations };
}

function citationsFrom(doc: DocumentRecord, ranked: Scored[]): Citation[] {
  return ranked.slice(0, 4).map((r) => ({
    passageId: r.passage.id,
    page: r.passage.page,
    snippet: trimSentence(r.passage.text, 220),
    score: Math.round(r.score * 1000) / 1000,
  }));
}

function composeSummaryAnswer(doc: DocumentRecord, citations: Citation[]): string {
  const bits = doc.summary.bullets.slice(0, 4).map((b, i) => `${i + 1}. ${b}`).join(' ');
  return `${doc.summary.abstract} Key takeaways — ${bits} Indexed across ${doc.pages} page${doc.pages === 1 ? '' : 's'} and ${doc.passages.length} passages${citations[0] ? `, with the densest evidence beginning on page ${citations[0].page}` : ''}.`;
}

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'ingest',
    layer: 'node',
    label: 'Gateway ingest',
    detail: 'Express multipart received. SHA-256 hashed. Object stored. Job enqueued on BullMQ.',
  },
  {
    id: 'parse',
    layer: 'python',
    label: 'PDF geometry',
    detail: 'pdfplumber + pypdf extract page boxes, fonts, and reading order. OCR fallback via Tesseract.',
  },
  {
    id: 'nlp',
    layer: 'python',
    label: 'Linguistic parse',
    detail: 'spaCy NER, sentence segmentation, heading detection, and MiniLM passage embeddings.',
  },
  {
    id: 'index',
    layer: 'postgres',
    label: 'Durable index',
    detail: 'documents, passages, embeddings written. pgvector IVFFlat index refreshed.',
  },
  {
    id: 'reason',
    layer: 'llm',
    label: 'Reasoning ready',
    detail: 'Retrieval graph compiled. Citation spans aligned to page coordinates.',
  },
];
