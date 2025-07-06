"use client"

import { ThemeProvider } from "@/providers/theme-provider"
import ReactQueryProvider from "./react-query"

const Providers = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </ThemeProvider>
  )
}

export default Providers
