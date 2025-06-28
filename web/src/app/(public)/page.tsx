import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Record and share videos with ease
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl">
          An open source alternative to Loom.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium"
        >
          Get Started Free
        </Link>
      </div>
    </main>
  )
}
