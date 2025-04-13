import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export function loader({ request }: LoaderFunctionArgs) {
  // Return an empty service worker
  return new Response("// Empty service worker", {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
    },
  });
} 