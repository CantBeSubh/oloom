import { SignOut } from "@/components/auth/sign-out"
import ScreenRecorder from "@/components/screen-recorder"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <ScreenRecorder />
        <SignOut />
      </div>
    </main>
  )
}
