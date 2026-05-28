"use client";

import { useEffect, useRef } from "react";
import type { KanbanCard } from "@/types/domain";
import { loadShownReminders, saveShownReminders } from "@/shared/utils/ui-preferences";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export function useKanbanNotifications(cards: KanbanCard[] | undefined) {
  const shownRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    if (!cards?.length) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }

    if (!shownRef.current) {
      shownRef.current = loadShownReminders();
    }
    const shown = shownRef.current;
    let changed = false;

    const today = todayIso();

    for (const card of cards) {
      if (card.statusCode === "HECHO") continue;

      if (card.dueDate && card.dueDate < today) {
        notify("Kanban vencido", card.text);
      } else if (card.dueDate === today) {
        notify("Kanban vence hoy", card.text);
      }

      if (card.reminderAt && card.reminderAt <= new Date().toISOString() && !shown.has(card.id)) {
        notify("Recordatorio Kanban", card.text);
        shown.add(card.id);
        changed = true;
      }
    }

    if (changed) saveShownReminders(shown);
  }, [cards]);
}
