import type { Metadata } from "next";

import { NotesView } from "@/components/dashboard/notes-view";

export const metadata: Metadata = {
  title: "Notepad",
  robots: { index: false, follow: false },
};

export default function AdminNotepadPage() {
  return <NotesView />;
}
