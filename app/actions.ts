"use server";

import { createClient } from "@/lib/supabase/server";
import { todayWIB } from "@/lib/date";
import { revalidatePath } from "next/cache";

// Catatan keamanan: kita TIDAK pernah mengirim user_id dari sini.
// Kolom user_id terisi otomatis oleh DEFAULT auth.uid() di database,
// dan RLS menolak baris milik orang lain. Keamanan ada di database.

export async function addTask(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  // Field opsional dari quick-add yang diperluas
  const priority = Number(formData.get("priority")) || 2;
  const category = (formData.get("category") as string)?.trim() || "umum";
  const due_date = (formData.get("due_date") as string) || todayWIB();
  const due_time = (formData.get("due_time") as string) || null;

  const supabase = createClient();
  await supabase.from("tasks").insert({ title, priority, category, due_date, due_time });

  // "layout" = refresh SEMUA halaman (Hari Ini & Semua Tugas),
  // karena kedua halaman menampilkan data tasks yang sama.
  revalidatePath("/", "layout");
}

export async function toggleTask(id: number, isDone: boolean) {
  const supabase = createClient();
  await supabase
    .from("tasks")
    .update({
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/", "layout");
}

export async function deleteTask(id: number) {
  const supabase = createClient();
  await supabase.from("tasks").delete().eq("id", id);

  revalidatePath("/", "layout");
}

export async function updateTask(id: number, formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  const note = (formData.get("note") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim() || "umum";
  const priority = Number(formData.get("priority")) || 2;
  const due_date = (formData.get("due_date") as string) || null;
  const due_time = (formData.get("due_time") as string) || null;

  const supabase = createClient();

  const { data: lama } = await supabase
    .from("tasks")
    .select("due_date, due_time")
    .eq("id", id)
    .single();

  const jamLama = lama?.due_time ? String(lama.due_time).slice(0, 5) : null;
  const jadwalBerubah = lama?.due_date !== due_date || jamLama !== due_time;

  await supabase
    .from("tasks")
    .update({
      title,
      note,
      category,
      priority,
      due_date,
      due_time,
      ...(jadwalBerubah ? { reminded_d1: false, reminded_h5: false } : {}),
    })
    .eq("id", id);

  revalidatePath("/", "layout");
}