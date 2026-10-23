export type FileKind = 'pdf' | 'txt' | 'md' | 'docx';

export type ProcessStage = {
  id: string;
  layer: 'node' | 'python' | 'postgres' | 'llm';
  label: string;
  detail: string;
};

export type Passage = {
  id: string;
  page: number;
  index: number;
  text: string;
  heading?: string;
};

export type Citation = {
  passageId: string;
  page: number;
  snippet: string;
  score: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  createdAt: number;
};

export type DocSummary = {
  abstract: string;
  bullets: string[];
  entities: { label: string; value: string }[];
  keywords: { term: string; weight: number }[];
  topics: string[];
};

export type DocumentRecord = {
  id: string;
  name: string;
  kind: FileKind;
  size: number;
  folderId: string;
  createdAt: number;
  pages: number;
  rawText: string;
  passages: Passage[];
  summary: DocSummary;
  status: 'ready' | 'processing' | 'error';
  source: 'sample' | 'upload';
  notes?: string;
};

export type FolderRecord = {
  id: string;
  name: string;
  hue: string;
  createdAt: number;
};

export type WorkspaceState = {
  folders: FolderRecord[];
  documents: DocumentRecord[];
  messages: Record<string, ChatMessage[]>;
  activeDocId: string | null;
  activeFolderId: string;
};

export type SearchHit = {
  documentId: string;
  documentName: string;
  passage: Passage;
  score: number;
};
