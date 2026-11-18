import { connection } from "next/server";
import { readAll } from "@/lib/db";

export async function GET() {
  await connection(); // always read live data; never prerender at build time
  try {
    return Response.json(await readAll(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("GET /api/db failed", e);
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}
