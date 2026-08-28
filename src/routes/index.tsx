import { createFileRoute } from "@tanstack/react-router";
import { NazlawiApp } from "@/components/nazlawi/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <NazlawiApp />;
}
