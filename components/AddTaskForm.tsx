"use client";

import { addTask } from "@/app/actions";
import { useToast } from "@/components/Toast";
import { Button, IconButton } from "@/components/ui/Button";
import { Loader2, Plus, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";

const inputCls =
  "rounded-xl border border-line bg-moss px-3 py-2 text-sm text-ivory placeholder:text-ash/60 transition focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/25";

export default function AddTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  return (
    <form
      id="tambah"
      ref={formRef}
      action={async (formData) => {
        setPending(true);
        try {
          await addTask(formData);
          formRef.current?.reset();
          toast("Tugas ditambahkan");
        } finally {
          setPending(false);
        }
      }}
      className="scroll-mt-24 rounded-card border border-line bg-surface p-2.5"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="judul-baru" className="sr-only">
          Judul tugas baru
        </label>
        <input
          id="judul-baru"
          name="title"
          placeholder="Tulis tugas, tekan Enter..."
          autoComplete="off"
          required
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-ivory placeholder:text-ash/60 focus:outline-none"
        />
        <IconButton
          type="button"
          label={showDetail ? "Sembunyikan detail" : "Atur detail tugas"}
          onClick={() => setShowDetail((v) => !v)}
          className={showDetail ? "bg-moss text-lime" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
        </IconButton>
        <Button
          type="submit"
          disabled={pending}
          className="min-h-[40px] px-3.5 py-2"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden sm:inline">Tambah</span>
        </Button>
      </div>

      {/* Detail opsional — default: prioritas sedang, kategori umum, due hari ini */}
      {showDetail && (
        <div className="mt-2 flex animate-rise flex-wrap gap-2 border-t border-line pt-2.5">
          <label className="sr-only" htmlFor="prioritas-baru">
            Prioritas
          </label>
          <select id="prioritas-baru" name="priority" defaultValue={2} className={inputCls}>
            <option value={1}>Tinggi</option>
            <option value={2}>Sedang</option>
            <option value={3}>Rendah</option>
          </select>
          <label className="sr-only" htmlFor="kategori-baru">
            Kategori
          </label>
          <input
            id="kategori-baru"
            name="category"
            placeholder="Kategori (mis. kuliah)"
            className={`${inputCls} w-32 flex-1`}
          />
          <label className="sr-only" htmlFor="tenggat-baru">
            Tanggal jatuh tempo
          </label>
          <input id="tenggat-baru" type="date" name="due_date" className={inputCls} />
                    <label className="sr-only" htmlFor="jam-baru">
            Jam deadline (opsional)
          </label>
          <input id="jam-baru" type="time" name="due_time" className={inputCls} />
        </div>
      )}
    </form>
  );
}
