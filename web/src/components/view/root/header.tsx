import SignIn from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"
import { ThemeToggle } from "@/components/theme-toggle"
import { auth } from "@/server/auth"
import Link from "next/link"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">oloom</span>
          </Link>
        </div>

        {session ? (
          <div className="flex items-center gap-2">
            <SignOut />
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignIn />
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  )
}
