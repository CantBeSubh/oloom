import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    </main>
  )
}
