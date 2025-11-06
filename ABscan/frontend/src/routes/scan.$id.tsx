import { createFileRoute } from "@tanstack/react-router";
import ScanComponent from "../components/Scan";

export const Route = createFileRoute("/scan/$id")({
  component: ScanPage,
});

function ScanPage() {
  return <ScanComponent />;
}
