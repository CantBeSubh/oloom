import { auth } from "@/server/auth"
import { redirect } from "next/navigation"

const AuthLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }
  return (
    <div>
      AuthLayout
      {children}
    </div>
  )
}

export default AuthLayout
