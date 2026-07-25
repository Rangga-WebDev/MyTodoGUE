"use client";

import { deleteTask, toggleTask, updateTask } from "@/app/actions";
import { formatTanggal, todayWIB } from "@/lib/date";
import { useToast } from "@/components/Toast";
import { Button, IconButton } from "@/components/ui/Button";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export type Task = {
  id: number;
  title: string;
  note: string | null;
  category: string | null;
  priority: number;
  due_date: string | null;
  due_time: string | null;
  is_done: boolean;
};

// Titik warna + label — status tidak pernah disampaikan lewat warna saja
const PRIORITY = {
  1: { label: "Tinggi", dot: "bg-coral" },
  2: { label: "Sedang", dot: "bg-amber" },
  3: { label: "Rendah", dot: "bg-ash" },
} as const;

const inputCls =
  "rounded-xl border border-line bg-moss px-3 py-2 text-sm text-ivory placeholder:text-ash/60 transition focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/25";

export default function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  // ===== MODE EDIT (form inline) =====
  if (isEditing) {
    return (
      <li className="animate-rise px-3 py-3">
        <form
          action={async (formData) => {
            await updateTask(task.id, formData);
            setIsEditing(false);
            toast("Perubahan disimpan");
          }}
          className="space-y-2"
        >
          <label className="sr-only" htmlFor={`judul-${task.id}`}>
            Judul tugas
          </label>
          <input
            id={`judul-${task.id}`}
            name="title"
            defaultValue={task.title}
            required
            className={`${inputCls} w-full`}
          />
          <label className="sr-only" htmlFor={`catatan-${task.id}`}>
            Catatan
          </label>
          <textarea
            id={`catatan-${task.id}`}
            name="note"
            defaultValue={task.note ?? ""}
            placeholder="Catatan (opsional)"
            rows={2}
            className={`${inputCls} w-full`}
          />
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor={`prioritas-${task.id}`}>
              Prioritas
            </label>
            <select
              id={`prioritas-${task.id}`}
              name="priority"
              defaultValue={task.priority}
              className={inputCls}
            >
              <option value={1}>Tinggi</option>
              <option value={2}>Sedang</option>
              <option value={3}>Rendah</option>
            </select>
            <label className="sr-only" htmlFor={`kategori-${task.id}`}>
              Kategori
            </label>
            <input
              id={`kategori-${task.id}`}
              name="category"
              defaultValue={task.category ?? "umum"}
              placeholder="Kategori"
              className={`${inputCls} w-28 flex-1`}
            />
            <label className="sr-only" htmlFor={`tenggat-${task.id}`}>
              Tanggal jatuh tempo
            </label>
            <input
              id={`tenggat-${task.id}`}
              type="date"
              name="due_date"
              defaultValue={task.due_date ?? ""}
              className={inputCls}
            />
                        <label className="sr-only" htmlFor={`jam-${task.id}`}>
              Jam deadline
            </label>
            <input
              id={`jam-${task.id}`}
              type="time"
              name="due_time"
              defaultValue={task.due_time?.slice(0, 5) ?? ""}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="min-h-[40px] px-3 py-1.5">
              Simpan
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
              className="min-h-[40px] px-3 py-1.5"
            >
              Batal
            </Button>
          </div>
        </form>
      </li>
    );
  }

  // ===== MODE TAMPIL (baris list) =====
  const today = todayWIB();
  const isOverdue = !task.is_done && !!task.due_date && task.due_date < today;
  const isDueToday = !task.is_done && task.due_date === today;
  const prio = PRIORITY[task.priority as 1 | 2 | 3] ?? PRIORITY[2];
  const jam = task.due_time ? task.due_time.slice(0, 5) : null;

  return (
    <li className="group relative flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-moss/50">
      {/* Custom checkbox — lime saat aktif, animasi scale pada tanda centang */}
      <button
        role="checkbox"
        aria-checked={task.is_done}
        aria-label={`Tandai "${task.title}" ${
          task.is_done ? "belum selesai" : "selesai"
        }`}
        onClick={async () => {
          await toggleTask(task.id, !task.is_done);
          toast(task.is_done ? "Dikembalikan ke aktif" : "Tugas selesai");
        }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          task.is_done
            ? "border-lime bg-lime"
            : "border-line bg-transparent hover:border-lime"
        }`}
      >
        <Check
          aria-hidden
          className={`h-3.5 w-3.5 text-obsidian transition-transform duration-200 ${
            task.is_done ? "scale-100" : "scale-0"
          }`}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-relaxed ${
            task.is_done ? "text-ash line-through decoration-line" : "text-ivory"
          }`}
        >
          {task.title}
        </p>
        {task.note && (
          <p className="mt-0.5 text-xs leading-relaxed text-ash">{task.note}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 text-ash">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${prio.dot}`}
            />
            {prio.label}
          </span>
          {task.category && (
            <span className="rounded-full bg-lavender/15 px-2 py-0.5 text-lavender">
              {task.category}
            </span>
          )}
          {task.is_done ? (
            <span className="flex items-center gap-1 text-mint">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              Selesai
            </span>
          ) : isOverdue ? (
            <span className="flex items-center gap-1 font-semibold text-coral">
              <AlertCircle className="h-3 w-3" aria-hidden />
              Terlambat • {formatTanggal(task.due_date!)}
            </span>
                    ) : isDueToday ? (
            <span className="flex items-center gap-1 text-amber">
              <Clock className="h-3 w-3" aria-hidden />
              Hari ini{jam ? ` • ${jam}` : ""}
            </span>
          ) : task.due_date ? (
            <span className="flex items-center gap-1 text-ash">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {formatTanggal(task.due_date)}
              {jam ? ` • ${jam}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {/* Quick actions — muncul saat hover di desktop, selalu tampil di mobile */}
      <div className="flex shrink-0 gap-0.5 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
        <IconButton label="Edit tugas" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" aria-hidden />
        </IconButton>
        <IconButton
          label="Hapus tugas"
          danger
          onClick={async () => {
            if (confirm(`Hapus tugas "${task.title}"?`)) {
              await deleteTask(task.id);
              toast("Tugas dihapus", "danger");
            }
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>
    </li>
  );
}
