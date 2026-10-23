import { paginateText, passagesFromPages, summarizeDocument } from './nlp';
import type { DocumentRecord, FileKind } from './types';

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function detectKind(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'md') return 'md';
  if (ext === 'docx') return 'docx';
  return 'txt';
}

export async function extractFromFile(file: File): Promise<{ pages: { page: number; text: string }[]; kind: FileKind }> {
  const kind = detectKind(file.name);
  if (kind === 'pdf') {
    try {
      const pages = await extractPdfPages(file);
      if (pages.some((p) => p.text.trim().length > 12)) return { pages, kind };
    } catch {
      /* fall through to binary-safe text */
    }
  }
  const text = await file.text();
  const cleaned = text.replace(/\u0000/g, '').trim();
  if (!cleaned) {
    return {
      pages: [
        {
          page: 1,
          text: `${file.name} was received (${Math.round(file.size / 1024)} KB) but contained no extractable text. Scanned image PDFs require the Python OCR worker (Tesseract) in production.`,
        },
      ],
      kind,
    };
  }
  return { pages: paginateText(cleaned), kind };
}

async function extractPdfPages(file: File): Promise<{ page: number; text: string }[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: { page: number; text: string }[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as { str?: string }[];
    const text = items
      .map((it) => it.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push({ page: i, text: text || `[Page ${i} contained no extractable text layer.]` });
  }
  return pages;
}

export function buildDocument(
  name: string,
  size: number,
  folderId: string,
  pages: { page: number; text: string }[],
  kind: FileKind,
  source: 'sample' | 'upload',
  notes?: string,
): DocumentRecord {
  const passages = passagesFromPages(pages);
  const summary = summarizeDocument(name, pages, passages);
  return {
    id: uid('doc'),
    name,
    kind,
    size,
    folderId,
    createdAt: Date.now(),
    pages: pages.length,
    rawText: pages.map((p) => p.text).join('\n\n'),
    passages,
    summary,
    status: 'ready',
    source,
    notes,
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
