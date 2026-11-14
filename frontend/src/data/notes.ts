import { storage } from "@/src/utils/storage";

export type Note = { id: string; title: string; body: string; updatedAt: string };

const KEY = "notes.v1";

export async function loadNotes(): Promise<Note[]> {
  const raw = await storage.getItem<string>(KEY, "[]");
  try {
    const list = JSON.parse(raw ?? "[]") as Note[];
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

async function saveAll(list: Note[]) {
  await storage.setItem(KEY, JSON.stringify(list));
}

export async function getNote(id: string): Promise<Note | undefined> {
  return (await loadNotes()).find((n) => n.id === id);
}

export async function upsertNote(note: Omit<Note, "updatedAt">): Promise<void> {
  const list = await loadNotes();
  const next: Note = { ...note, updatedAt: new Date().toISOString() };
  const i = list.findIndex((n) => n.id === note.id);
  if (i >= 0) list[i] = next;
  else list.unshift(next);
  await saveAll(list);
}

export async function deleteNote(id: string): Promise<void> {
  await saveAll((await loadNotes()).filter((n) => n.id !== id));
}

export const newNoteId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
