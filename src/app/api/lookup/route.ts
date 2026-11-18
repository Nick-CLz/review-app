import { connection } from "next/server";
import { lookupBarcode, searchProducts } from "@/lib/off";

// GET /api/lookup?barcode=8850987101021  -> { product }
// GET /api/lookup?q=mama tom yum         -> { products }
export async function GET(req: Request) {
  await connection();
  const url = new URL(req.url);
  const barcode = url.searchParams.get("barcode")?.trim();
  const q = url.searchParams.get("q")?.trim();
  try {
    if (barcode) return Response.json({ product: await lookupBarcode(barcode) });
    if (q) return Response.json({ products: await searchProducts(q) });
    return Response.json({ error: "Pass ?barcode= or ?q=" }, { status: 400 });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("lookup failed", msg);
    return Response.json({ error: msg.startsWith("Barcode") ? msg : "Product lookup is unavailable right now" }, { status: msg.startsWith("Barcode") ? 400 : 502 });
  }
}
