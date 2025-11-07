import { Link, Outlet, createRootRoute } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <nav className="flex items-center justify-center gap-6 bg-white shadow-sm rounded-lg px-6 py-3">
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/history">История</NavLink>
      </nav>

      <main className="container mx-auto mt-16">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors",
        "px-3 py-2 rounded-md hover:bg-gray-100"
      )}
    >
      {children}
    </Link>
  )
}