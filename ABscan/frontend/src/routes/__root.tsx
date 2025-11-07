import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="p-4">
      <nav className="space-x-4">
        <Link to="/">Главная</Link>
        <Link to="/history">История</Link>
      </nav>
      <hr className="my-4" />
      <Outlet />
    </div>
  );
}
