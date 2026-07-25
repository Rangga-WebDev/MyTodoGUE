import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: tasks, error } = await supabase.from("tasks").select("*");

  return (
    <main className="p-8 font-mono text-sm">
      <div className="mb-4 flex justify-between">
        <p>Login sebagai: {user?.email}</p>
        <LogoutButton />
      </div>
      <pre>{JSON.stringify({ tasks, error }, null, 2)}</pre>
    </main>
  );
}