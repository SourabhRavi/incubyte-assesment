export default function AppLoadingScreen() {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-background px-6 text-foreground"
      role="status"
      aria-live="polite"
      aria-label="Loading ACME PeopleOps"
    >
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
          <span className="font-heading text-2xl font-semibold tracking-[-0.08em]">
            A
          </span>
        </div>

        <p className="font-heading text-lg font-semibold tracking-tight">
          ACME <span className="font-normal text-muted-foreground">PeopleOps</span>
        </p>

        <div className="mt-10 flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-3 animate-spin rounded-full border-[1.5px] border-muted-foreground/20 border-t-foreground motion-reduce:animate-none"
          />
          <span className="text-sm text-muted-foreground">
            Getting things ready
          </span>
        </div>
      </div>
    </main>
  )
}
