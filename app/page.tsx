import SampleCounter from "@/components/SampleCounter";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-32">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          AI Template
        </h1>
        <p className="text-sm text-muted-foreground">
          Redux Toolkit + React Query + Axios — ready to go.
        </p>

        {/* Redux Sample Counter */}
        <SampleCounter />
      </main>
    </div>
  );
}

