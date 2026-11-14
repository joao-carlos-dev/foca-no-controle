import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Calendar, User, LogOut, Menu } from "lucide-react"
import { Button } from "./button"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/visao-anual", icon: Calendar, label: "Visão Anual" },
    { path: "/perfil", icon: User, label: "Perfil" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Desktop / Header Mobile */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col justify-between p-4 z-20">
        <div>
          <div className="flex items-center justify-between md:mb-8">
            <h1 className="text-xl font-bold bg-(image:--gradient-primary) bg-clip-text text-transparent">
              Foca no Controle
            </h1>
            <Button variant="ghost" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <nav className="hidden md:flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:block">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto z-10 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}