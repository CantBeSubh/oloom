import { Button } from "@/components/ui/button"
import { signOut } from "@/server/auth"

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/" })
      }}
    >
      <Button variant="outline" type="submit">
        Sign Out
      </Button>
    </form>
  )
}
