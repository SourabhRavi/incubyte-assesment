export default function AppLoadingScreen() {
  return (
    <main
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading ACME PeopleOps"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl"
      />

      <section className="relative w-full max-w-[920px]">
        <header className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
              A
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-[15px] font-bold tracking-tight">
                ACME
              </span>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                PeopleOps
              </span>
            </span>
          </div>
          <span className="hidden rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
            Workforce intelligence
          </span>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_rgb(15_23_42/8%)]">
          <div className="grid min-h-[390px] md:grid-cols-[190px_minmax(0,1fr)]">
            <aside
              aria-hidden="true"
              className="hidden border-r border-border bg-muted/35 p-5 md:block"
            >
              <div className="mb-10 flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/15" />
                <div className="h-3 w-16 rounded-full bg-muted-foreground/15" />
              </div>
              <div className="mb-3 h-2 w-16 rounded-full bg-muted-foreground/15" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5">
                  <div className="size-4 rounded bg-primary/30" />
                  <div className="h-2 w-20 rounded-full bg-primary/30" />
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="size-4 rounded bg-muted-foreground/15" />
                  <div className="h-2 w-24 rounded-full bg-muted-foreground/15" />
                </div>
              </div>
              <div className="mt-24 border-t border-border pt-5">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-muted-foreground/15" />
                  <div className="space-y-2">
                    <div className="h-2 w-16 rounded-full bg-muted-foreground/15" />
                    <div className="h-1.5 w-12 rounded-full bg-muted-foreground/10" />
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 p-5 sm:p-7">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="h-5 w-36 rounded-md bg-foreground/10 sm:w-48" />
                  <div className="h-2.5 w-48 rounded-full bg-muted-foreground/15 sm:w-64" />
                </div>
                <div className="h-9 w-24 shrink-0 rounded-lg border border-border bg-muted/50" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["w-9", "w-12", "w-10", "w-8"].map((width, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-background p-3 sm:p-4"
                  >
                    <div className="mb-4 h-2 w-14 rounded-full bg-muted-foreground/15" />
                    <div className={`h-5 ${width} rounded-md bg-foreground/10`} />
                    <div className="mt-3 h-1.5 w-16 rounded-full bg-muted-foreground/10" />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.35fr_1fr]">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-5 h-3 w-28 rounded-full bg-foreground/10" />
                  <div className="flex h-32 items-end gap-2 px-2">
                    {[42, 68, 52, 84, 61, 95, 72, 58, 88, 66].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-sm bg-primary/15"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                  <div className="mt-3 h-px bg-border" />
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-5 h-3 w-24 rounded-full bg-foreground/10" />
                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="size-7 rounded-lg bg-primary/10" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-2 w-3/4 rounded-full bg-muted-foreground/15" />
                          <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-center gap-3 border-t border-border bg-muted/25 px-5 py-4">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary motion-reduce:animate-none"
            />
            <span className="text-xs font-medium text-muted-foreground">
              Preparing your workspace
            </span>
            <span className="hidden text-[11px] text-muted-foreground/60 sm:inline">
              This should only take a moment
            </span>
          </footer>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground/70">
          Your people data, all in one place.
        </p>
      </section>
    </main>
  )
}
