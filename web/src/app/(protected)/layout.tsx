import { auth } from "@/server/auth"
import { redirect } from "next/navigation"

const ProtectedLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }
  return <div>{children}</div>
}

export default ProtectedLayout
