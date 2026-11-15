import type { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-350 mx-auto">
        {children}
      </main>
    </div>
  )
}