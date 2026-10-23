import type { WorkspaceState, FolderRecord, DocumentRecord, ChatMessage } from './types';
import { SAMPLE_DOCS, FOLDER_HUES } from './samples';
import { buildDocument } from './pdf';
import { paginateText } from './nlp';

const KEY = 'documind.workspace.v1';

function seedFolders(): FolderRecord[] {
  const names = ['Inbox', 'Legal', 'Research', 'Compliance', 'Product'];
  return names.map((name, i) => ({
    id: `folder-${name.toLowerCase()}`,
    name,
    hue: FOLDER_HUES[name] || '#d4af37',
    createdAt: Date.now() - (names.length - i) * 86400000,
  }));
}

export function seedWorkspace(): WorkspaceState {
  const folders = seedFolders();
  const documents: DocumentRecord[] = SAMPLE_DOCS.map((s) => {
    const folder = folders.find((f) => f.name === s.folder) || folders[0];
    const pages = paginateText(s.text, 1500);
    return buildDocument(s.name, s.text.length, folder.id, pages, s.kind, 'sample', s.notes);
  });
  return {
    folders,
    documents,
    messages: {},
    activeDocId: documents[0]?.id ?? null,
    activeFolderId: 'all',
  };
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedWorkspace();
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (!parsed.folders?.length || !parsed.documents) return seedWorkspace();
    return parsed;
  } catch {
    return seedWorkspace();
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    const slim: WorkspaceState = {
      ...state,
      documents: state.documents.map((d) => ({
        ...d,
        rawText: d.rawText.slice(0, 240000),
      })),
    };
    localStorage.setItem(KEY, JSON.stringify(slim));
  } catch {
    /* quota */
  }
}

export function resetWorkspace(): WorkspaceState {
  localStorage.removeItem(KEY);
  return seedWorkspace();
}

export function appendMessage(
  state: WorkspaceState,
  docId: string,
  msg: ChatMessage,
): WorkspaceState {
  const list = state.messages[docId] ? [...state.messages[docId], msg] : [msg];
  return { ...state, messages: { ...state.messages, [docId]: list } };
}
