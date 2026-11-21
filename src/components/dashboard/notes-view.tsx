"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, StickyNote, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { PageSection } from "@/components/dashboard/page-section";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { notesApi } from "@/lib/api/services";
import { queryKeys } from "@/lib/query-keys";
import { cn, formatRelative, getErrorMessage } from "@/lib/utils";
import type { Note } from "@/types";

const NOTE_COLORS = [
  "#facc15",
  "#fb923c",
  "#f472b6",
  "#a78bfa",
  "#38bdf8",
  "#34d399",
] as const;

interface DraftState {
  title: string;
  content: string;
  color: string;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  content: "",
  color: NOTE_COLORS[0],
};

export function NotesView() {
  const queryClient = useQueryClient();
  const listKey = queryKeys.notes.list();
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftState>(EMPTY_DRAFT);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<DraftState>(EMPTY_DRAFT);
  const [deleting, setDeleting] = React.useState<Note | null>(null);

  const query = useQuery({
    queryKey: listKey,
    queryFn: () => notesApi.list(),
  });

  const refresh = React.useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.all() }),
    [queryClient],
  );

  const create = useMutation({
    mutationFn: () =>
      notesApi.create({
        title: draft.title.trim() || null,
        content: draft.content.trim(),
        color: draft.color,
      }),
    onSuccess: () => {
      setDraft(EMPTY_DRAFT);
      setCreating(false);
      refresh();
      toast.success("Note saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: (id: string) =>
      notesApi.update(id, {
        title: editDraft.title.trim() || null,
        content: editDraft.content.trim(),
        color: editDraft.color,
      }),
    onSuccess: () => {
      setEditingId(null);
      refresh();
      toast.success("Note updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => notesApi.remove(id),
    onSuccess: () => {
      setDeleting(null);
      refresh();
      toast.success("Note deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditDraft({
      title: note.title ?? "",
      content: note.content,
      color: note.color,
    });
  };

  const notes = query.data ?? [];

  return (
    <div className="space-y-4">
      <PageSection
        title="My notepad"
        description="Private notes saved to your account — available on any device."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setCreating((value) => !value);
              setDraft(EMPTY_DRAFT);
            }}
          >
            {creating ? (
              <>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New note
              </>
            )}
          </Button>
        }
      >
        {creating ? (
          <div className="mb-5 border border-border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                aria-label="Note title"
                placeholder="Title (optional)"
                maxLength={120}
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
              />
              <ColorPicker
                value={draft.color}
                onChange={(color) => setDraft((current) => ({ ...current, color }))}
              />
            </div>
            <Textarea
              aria-label="Note content"
              placeholder="Write something to remember…"
              className="mt-3 min-h-28 resize-y"
              maxLength={10000}
              value={draft.content}
              onChange={(event) =>
                setDraft((current) => ({ ...current, content: event.target.value }))
              }
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                loading={create.isPending}
                disabled={!draft.content.trim()}
                onClick={() => create.mutate()}
              >
                Save note
              </Button>
            </div>
          </div>
        ) : null}

        {query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-none" />
            ))}
          </div>
        ) : notes.length === 0 && !creating ? (
          <EmptyState
            icon={StickyNote}
            title="No notes yet"
            description="Create your first note to keep track of ideas, reminders and to-dos."
            action={
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New note
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const current = isEditing ? editDraft : null;

              return (
                <div
                  key={note.id}
                  className="flex min-h-40 flex-col border border-border bg-card"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: note.color,
                    backgroundImage: `linear-gradient(${note.color}0f, ${note.color}0f)`,
                  }}
                >
                  {isEditing && current ? (
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          aria-label="Note title"
                          placeholder="Title (optional)"
                          maxLength={120}
                          value={current.title}
                          onChange={(event) =>
                            setEditDraft((value) => ({
                              ...value,
                              title: event.target.value,
                            }))
                          }
                        />
                        <ColorPicker
                          value={current.color}
                          onChange={(color) =>
                            setEditDraft((value) => ({ ...value, color }))
                          }
                        />
                      </div>
                      <Textarea
                        aria-label="Note content"
                        className="min-h-24 flex-1 resize-y"
                        maxLength={10000}
                        value={current.content}
                        onChange={(event) =>
                          setEditDraft((value) => ({
                            ...value,
                            content: event.target.value,
                          }))
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          loading={update.isPending}
                          disabled={!current.content.trim()}
                          onClick={() => update.mutate(note.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 p-4">
                        {note.title ? (
                          <p className="font-display text-sm font-semibold text-foreground">
                            {note.title}
                          </p>
                        ) : null}
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelative(note.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${note.title || "note"}`}
                            onClick={() => startEdit(note)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${note.title || "note"}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleting(note)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageSection>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Delete this note?"
        description="This note will be permanently removed from your notepad."
        confirmLabel="Delete"
        loading={remove.isPending}
        destructive
      />
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 self-center">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Color
      </span>
      <div className="flex items-center gap-1.5">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Use color ${color}`}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
              value === color
                ? "border-foreground scale-110"
                : "border-transparent",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
