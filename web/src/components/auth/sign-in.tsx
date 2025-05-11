import { Button } from "@/components/ui/button"
import { signIn } from "@/server/auth"
import { GithubIcon } from "lucide-react"

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}
    >
      <Button variant="outline" type="submit">
        Login
        <GithubIcon className="size-4" />
      </Button>
    </form>
  )
}
