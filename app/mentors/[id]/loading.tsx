// app/mentors/[id]/loading.tsx//
export default function Loading() {
  return (
    <section className="section">
      <div className="container animate-pulse">
        <div className="mb-6 h-8 w-64 rounded bg-white/10" />
        <div className="mb-2 h-5 w-80 rounded bg-white/10" />
        <div className="h-4 w-56 rounded bg-white/10" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-40 rounded bg-white/10 md:col-span-2" />
          <div className="h-40 rounded bg-white/10" />
        </div>
      </div>
    </section>
  );
}
