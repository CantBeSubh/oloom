import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex h-full items-center justify-center">
      <Link href="/dashboard">Go to Dashboard</Link>
    </main>
  )
}
