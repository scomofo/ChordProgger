import { createFileRoute } from "@tanstack/react-router";
import { CadenceApp } from "@/components/cadence/cadence-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CadenceApp />;
}
