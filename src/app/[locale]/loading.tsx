export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center bg-mesh py-20">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="h-10 w-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </main>
  );
}
